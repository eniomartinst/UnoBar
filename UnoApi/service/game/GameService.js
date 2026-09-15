import jwt from 'jsonwebtoken';
import Game from '../repository/Game.js';
import User from '../repository/User.js';
import Round from '../repository/Round.js';
import BusinessException from '../config/exceptions/BusinessException.js';
import NotFoundException from '../config/exceptions/NotFoundException.js';
import { pipe } from '../config/utils/fp.js';

// ---------------------------------------------------------------------------
// Funções auxiliares puras (sem efeitos colaterais)
// ---------------------------------------------------------------------------

// findGameOrThrow :: id -> Promise<Game>  (helper curriado de acesso ao DB)
const findGameOrThrow = async (id) => {
  const game = await Game.findByPk(id);
  if (!game) throw new NotFoundException(`Jogo com ID ${id} não encontrado.`);
  return game;
};

// decodeUsername :: token -> Promise<string>
// O payload JWT da API tem formato { user: { id, username, name } }.
// Busca o username no token ou no banco usando o ID.
const decodeUsername = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) return 'Jogador';
    if (decoded.username || decoded.name) return decoded.username || decoded.name;
    if (decoded.user) {
      if (decoded.user.username) return decoded.user.username;
      if (decoded.user.name) return decoded.user.name;
      if (decoded.user.id) {
        const user = await User.findByPk(decoded.user.id);
        if (user) return user.username;
      }
    }
    return 'Jogador';
  } catch {
    return 'Jogador';
  }
};

// findUserByTokenOrUsername :: (token, username) -> users[] -> user | undefined
const findUserByTokenOrUsername = (token, username) => (users) =>
  users.find((u) => u.token === token || (username && u.username === username));

// isCreator :: user -> boolean
const isCreator = (user) => user && user.isCreator === true;


// extractUsernames :: users[] -> string[]
const extractUsernames = (users) => users.map((u) => u.username);

// getCurrentPlayer :: (users[], index) -> string | null
const getCurrentPlayer = (users, index) =>
  (users[index ?? 0] || {}).username ?? null;

// ---------------------------------------------------------------------------
// Serviço — Todas as funções são puras em relação ao estado local;
// os efeitos colaterais (DB) estão isolados em cada função de serviço.
// ---------------------------------------------------------------------------

const GameService = {
  // ─── CRUD base ────────────────────────────────────────────────────────────
  create: async (data) => await Game.create(data),
  findAll: async () => await Game.findAll(),

  findById: async (id) => {
    const game = await Game.findByPk(id);
    if (!game) throw new NotFoundException(`Jogo com ID ${id} não encontrado.`);
    return game;
  },

  update: async (id, data) => {
    const existingGame = await Game.findByPk(id);
    if (!existingGame) throw new NotFoundException(`Jogo com ID ${id} não encontrado.`);
    await Game.update(data, { where: { id } });
    return await Game.findByPk(id);
  },

  delete: async (id) => {
    const existingGame = await Game.findByPk(id);
    if (!existingGame) throw new NotFoundException(`Jogo com ID ${id} não encontrado.`);
    await Game.destroy({ where: { id } });
    return true;
  },

  // ─── Entrar no jogo ─────────────────────────────────────────
  joinGame: async (data) => {
    const game = await findGameOrThrow(data.game_id);
    if (game.status !== 'waiting') throw new BusinessException('Este jogo já começou ou foi encerrado.');

    const username = await decodeUsername(data.access_token);
    const currentUsers = game.usersInGame || [];
    const alreadyJoined = findUserByTokenOrUsername(data.access_token, username)(currentUsers);

    if (!alreadyJoined) {
      if (currentUsers.length >= game.maxPlayers) throw new BusinessException('A sala está cheia.');

      const newUser = {
        username,
        isCreator: currentUsers.length === 0,
        isReady: true
      };

      // Imutabilidade: cria novo array em vez de mutar o existente
      const updatedUsers = [...currentUsers, newUser];
      await Game.update({ usersInGame: updatedUsers }, { where: { id: game.id } });
    }
    return true;
  },

  // ─── Iniciar o jogo ─────────────────────────────────────────
  startGame: async (data) => {
    const game = await findGameOrThrow(data.game_id);
    const currentUsers = game.usersInGame || [];
    const username = await decodeUsername(data.access_token);
    const user = findUserByTokenOrUsername(data.access_token, username)(currentUsers);

    if (!user) throw new BusinessException('Você não está nesta partida.');
    if (!isCreator(user)) throw new BusinessException('Apenas o criador pode iniciar a partida.');
    if (currentUsers.length < 2) throw new BusinessException('Mínimo de 2 jogadores para iniciar.');
    if (!currentUsers.every((u) => u.isReady)) throw new BusinessException('Nem todos os jogadores estão prontos.');

    await Game.update({ status: 'in_progress', currentPlayerIndex: 0 }, { where: { id: game.id } });
    return true;
  },


  // ─── Sair do jogo ───────────────────────────────────────────
  leaveGame: async (data) => {
    const game = await findGameOrThrow(data.game_id);
    const currentUsers = game.usersInGame || [];
    const username = await decodeUsername(data.access_token);

    // Remove o jogador que está saindo (comparando por username ou token)
    const updatedUsers = currentUsers.filter((u) => u.username !== username && u.token !== data.access_token);

    // Se não sobrar ninguém na sala, encerra o jogo e deleta a partida do banco
    if (updatedUsers.length === 0) {
      if (game.status === 'waiting') {
        await Game.update({ usersInGame: [] }, { where: { id: game.id } });
      } else {
        // Se a partida já estava em andamento ou finalizada, passa a foice no banco.
        try {
          await Game.destroy({ where: { id: game.id }, force: true });
        } catch (err) {
          await Game.update({ status: 'finished', usersInGame: [] }, { where: { id: game.id } });
        }
      }
      return true;
    }

    // UX: Se o criador da sala saiu, passa a "coroa" para o próximo jogador
    if (!updatedUsers.some((u) => u.isCreator)) {
      updatedUsers[0].isCreator = true;
    }

    await Game.update({ usersInGame: updatedUsers }, { where: { id: game.id } });
    return true;
  },

  // ─── Finalizar o jogo ───────────────────────────────────────
  //
  // Lógica (pipeline funcional):
  //   1. Busca o jogo pelo ID (ou lança NotFoundException)
  //   2. Valida que o status é 'in_progress' (ou lança BusinessException)
  //   3. Valida que o token pertence ao criador (ou lança BusinessException)
  //   4. Atualiza o status para 'finished'
  endGame: async (data) => {
    const game = await findGameOrThrow(data.game_id);

    // Validação de status via composição de verificações puras
    const validateStatus = (g) => {
      if (g.status !== 'in_progress') throw new BusinessException('O jogo não está em andamento.');
      return g;
    };

    // Currying: valida se o token é do criador, capturando `token` no closure
    const validateCreator = (token) => (g) => {
      const users = g.usersInGame || [];
      const user = findUserByTokenOrUsername(token, null)(users);
      if (!user) throw new BusinessException('Usuário não encontrado nesta partida.');
      if (!isCreator(user)) throw new BusinessException('Apenas o criador do jogo pode encerrá-lo.');
      return g;
    };

    // pipe :: composição left-to-right das validações puras
    const validate = pipe(
      validateStatus,
      validateCreator(data.access_token)
    );

    validate(game); // aplica ambas as validações em sequência

    await Game.update({ status: 'finished' }, { where: { id: game.id } });
    return true;
  },

  // ─── Obter estado atual do jogo ────────────────────────────
  getGameState: async (data) => {
    // Usa findGameOrThrow para centralizar o tratamento de 404
    return await findGameOrThrow(data.game_id);
  },

  // ─── Listar jogadores no jogo ──────────────────────────────
  //
  // Usa a HOF `map` (via extractUsernames) para transformar o array de objetos
  // em um array de strings, sem mutação.
  getPlayers: async (data) => {
    const game = await findGameOrThrow(data.game_id);
    // Demonstração explícita de HOF: map sobre usersInGame
    const playerNames = extractUsernames(game.usersInGame || []);
    return { game, playerNames };
  },

  // ─── Obter o jogador atual ─────────────────────────────────
  getCurrentTurnPlayer: async (data) => {
    const game = await findGameOrThrow(data.game_id);
    const users = game.usersInGame || [];
    const currentPlayer = getCurrentPlayer(users, game.currentPlayerIndex);
    return { game, currentPlayer };
  },

  // Pegar carta do topo da pilha de descarte
  getTopCard: async (data) => {
    const game = await findGameOrThrow(data.game_id);

    // Busca a rodada ativa da partida no banco de dados
    const activeRound = await Round.findOne({
      where: { gameId: game.id, status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    const discardPile = activeRound?.discardPile || [];
    const topCard = discardPile.at(-1);

    if (!topCard) {
      throw new BusinessException('A pilha de descarte está vazia.');
    }

    return {
      game_id: game.id,
      top_card: `${topCard.color} ${topCard.value}`
    };
  },

  // Obter pontuações atuais de todos os jogadores
  getScores: async (data) => {
    const game = await findGameOrThrow(data.game_id);

    const scoresObj = {};

    // Mapeia os jogadores que estão no array usersInGame da partida
    if (game.usersInGame && game.usersInGame.length > 0) {
      game.usersInGame.forEach(user => {
        scoresObj[user.username] = (game.totalScores || {})[user.username] || 0;
      });
    }

    return {
      game_id: game.id,
      scores: scoresObj
    };
  },
};

export default GameService;
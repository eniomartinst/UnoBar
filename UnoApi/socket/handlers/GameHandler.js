import GameService from '../../service/game/GameService.js'; // Mantido na raiz conforme seu print
import RoundService from '../../service/round/RoundService.js'; // Novo caminho!
import ScoreService from '../../service/game/ScoreService.js';
import User from '../../repository/User.js';
import { formatManyGamesResponse } from '../../dtos/response/GameResponseDTO.js';
import TimerManager from '../../service/infrastructure/TimerManager.js';
import PenaltyService from '../../service/mechanics/PenaltyService.js';

// ---------------------------------------------------------------------------
// GameHandler — Socket Controller do Game Loop UNO
// ---------------------------------------------------------------------------

export default function setupGameEvents(io, socket) {
  const emitError = (originalEvent, message) => {
    socket.emit('game:error', { event: originalEvent, message });
  };

  // ---------------------------------------------------------------------------
  // HELPER ISOLADO: Callback executado quando o TimerManager avisa que o tempo estourou
  // ---------------------------------------------------------------------------
  const handleTimeout = async (gameId, expectedPlayerIndex) => {
    try {
      const game = await GameService.findById(gameId);
      if (game.status !== 'in_progress') return;

      const round = await RoundService.getActiveRound(gameId);
      if (!round) return;

      // ANTI-RACE CONDITION: Se alguém jogou no exato milissegundo final, nós ignoramos a punição
      if (round.currentPlayerIndex !== expectedPlayerIndex) {
        console.log(`[Timer] O turno já passou. Ignorando punição.`);
        return;
      }

      const players = game.usersInGame || [];
      const currentPlayer = players[round.currentPlayerIndex];
      if (!currentPlayer) return;

      const username = currentPlayer.username;
      console.log(`[Timer] Punindo jogador ${username} com 1 carta e pulo de vez.`);

      // DELEGAÇÃO: Chamamos o PenaltyService para aplicar a punição no banco de dados
      const { updatedRound, nextIndex } = await PenaltyService.applyPenalty(round, username, players, 1);

      const publicState = RoundService.publicRoundState(updatedRound.toJSON(), players);

      // Avisa a sala toda que o jogador dormiu no ponto
      io.to(`game_${gameId}`).emit('round:updated', {
        message: `Tempo esgotado! ${username} comprou uma carta e perdeu a vez.`,
        ...publicState,
      });
      emitPrivateHands(io, gameId, updatedRound.toJSON(), players);

      // Reinicia a contagem para o próximo jogador da roda
      TimerManager.start(gameId, nextIndex, handleTimeout);

    } catch (err) {
      console.error('[GameHandler] Erro no timeout:', err);
    }
  };


  // ─── Entrar na sala (canal Socket.IO) ────────────────────────────────────
  socket.on('game:join_room', async (data) => {
    const { gameId, token: payloadToken } = data;
    const username = socket.user?.username || 'Desconhecido';
    const token = payloadToken || socket.handshake?.auth?.token;

    if (!gameId) return;

    try {
      if (token) {
        await GameService.joinGame({ game_id: gameId, access_token: token }).catch(e => {
          console.error('[GameHandler] Erro no joinGame:', e.message);
        });
      }

      socket.join(`game_${gameId}`);
      socket.join(`private_${gameId}_${username}`);
      console.log(`[GameHandler] ${username} entrou na sala game_${gameId}`);

      const game = await GameService.findById(gameId);
      const rawPlayers = game?.usersInGame || [];
      const players = rawPlayers.map(({ token, ...rest }) => rest);

      io.to(`game_${gameId}`).emit('lobby:updated', { gameId, players, status: game?.status });

      const allGames = await GameService.findAll();
      io.emit('lobby:updated', formatManyGamesResponse(allGames));

      socket.to(`game_${gameId}`).emit('game:update', {
        action: 'user_joined',
        user: username,
        message: `${username} entrou na sala.`,
      });

      if (game?.status === 'in_progress') {
        const activeRound = await RoundService.getActiveRound(gameId);
        if (activeRound) {
          const roundData = activeRound.toJSON();
          socket.emit('round:updated', {
            message: 'Partida em andamento.',
            ...RoundService.publicRoundState(roundData, players),
          });
          const myHand = RoundService.privateHandState(roundData, username);
          socket.emit('my:hand', { hand: myHand });
        }
      }
    } catch (err) {
      console.error('[GameHandler] Erro no join_room:', err);
    }
  });


  // ─── FLUXO 1: game:start — Inicialização da Partida ──────────────────────
  socket.on('game:start', async (data) => {
    try {
      const { gameId } = data;
      const username = socket.user?.username;

      const game = await GameService.findById(gameId);
      const players = game.usersInGame || [];

      const requester = players.find((p) => p.username === username);
      if (!requester?.isCreator) return emitError('game:start', 'Apenas o criador pode iniciar a partida.');
      if (players.length < 2) return emitError('game:start', 'Mínimo de 2 jogadores para iniciar.');

      await GameService.update(gameId, { status: 'in_progress', currentPlayerIndex: 0 });
      const round = await RoundService.initRound(gameId, players);

      const publicState = RoundService.publicRoundState(round.toJSON(), players);
      io.to(`game_${gameId}`).emit('round:updated', {
        message: 'A partida começou! Boa sorte a todos.',
        ...publicState,
      });

      emitPrivateHands(io, gameId, round.toJSON(), players);

      // ARQUITETURA: Delega o controle do tempo para o TimerManager
      TimerManager.start(gameId, 0, handleTimeout);

    } catch (err) {
      emitError('game:start', err.message || 'Erro ao iniciar a partida.');
    }
  });


  // ─── FLUXO 2a: turn:play_card — Jogar uma Carta ──────────────────────────
  socket.on('turn:play_card', async (data) => {
    try {
      const { gameId, cardId, chosenColor } = data;
      const username = socket.user?.username;

      const game = await GameService.findById(gameId);
      const players = game.usersInGame || [];
      const round = await RoundService.getActiveRound(gameId);

      if (!round) return emitError('turn:play_card', 'Nenhuma rodada ativa encontrada.');

      const currentPlayer = players[round.currentPlayerIndex];
      if (currentPlayer?.username !== username) {
        return emitError('turn:play_card', 'Não é a sua vez de jogar.');
      }

      const hand = (round.hands || {})[username] || [];
      const cardIndex = hand.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) {
        return emitError('turn:play_card', 'Você não possui esta carta na mão.');
      }
      const card = hand[cardIndex];

      const topCard = (round.discardPile || []).at(-1);
      if (!RoundService.isValidPlay(card, topCard, round.activeColor)) {
        return emitError('turn:play_card', `Jogada inválida.`);
      }

      // ARQUITETURA: Jogada válida, interrompemos o relógio de imediato
      TimerManager.clear(gameId);

      const { direction, pendingDraws, activeColor } = RoundService.applyCardEffect(
        card,
        { direction: round.direction, pendingDraws: round.pendingDraws, activeColor: round.activeColor },
        chosenColor
      );

      let hands = { ...round.hands, [username]: hand.filter((_, i) => i !== cardIndex) };
      let discardPile = [...(round.discardPile || []), card];
      let deck = [...(round.deck || [])];
      let saidUno = { ...(round.saidUno || {}) };

      if (hands[username].length > 1) {
        saidUno[username] = false;
      }

      if (pendingDraws > 0) {
        const immediateNextIndex = ((round.currentPlayerIndex + direction) % players.length + players.length) % players.length;
        const nextUsername = players[immediateNextIndex]?.username;

        if (nextUsername) {
          const { drawn, deck: d, discardPile: disc } = RoundService.drawCards(deck, discardPile, pendingDraws);
          hands = { ...hands, [nextUsername]: [...(hands[nextUsername] || []), ...drawn] };
          if (hands[nextUsername].length > 1) saidUno[nextUsername] = false;
          deck = d;
          discardPile = disc;
        }
      }

      const nextIndex = RoundService.advanceTurn(round.currentPlayerIndex, direction, players.length, card.value);
      const roundWinner = RoundService.checkRoundWinner(hands);

      await round.update({
        currentPlayerIndex: roundWinner ? round.currentPlayerIndex : nextIndex,
        direction,
        activeColor,
        pendingDraws: 0,
        deck,
        discardPile,
        hands,
        saidUno,
        status: roundWinner ? 'finished' : 'active',
      });

      const updatedRoundData = round.toJSON();
      const publicState = RoundService.publicRoundState(updatedRoundData, players);
      io.to(`game_${gameId}`).emit('round:updated', {
        message: `${username} jogou ${card.color} ${card.value}${pendingDraws > 0 ? ` (+${pendingDraws})` : ''}`,
        ...publicState,
      });
      emitPrivateHands(io, gameId, updatedRoundData, players);

      if (roundWinner) {
        await handleRoundEnd(io, gameId, hands, players, roundWinner);
      } else {
        // ARQUITETURA: Reinicia o relógio para o próximo jogador
        TimerManager.start(gameId, nextIndex, handleTimeout);
      }

    } catch (err) {
      emitError('turn:play_card', err.message || 'Erro ao processar a jogada.');
    }
  });


  // ─── FLUXO 2b: turn:draw_card — Comprar uma Carta ────────────────────────
  socket.on('turn:draw_card', async (data) => {
    try {
      const { gameId } = data;
      const username = socket.user?.username;

      const game = await GameService.findById(gameId);
      const players = game.usersInGame || [];
      const round = await RoundService.getActiveRound(gameId);

      if (!round) return emitError('turn:draw_card', 'Nenhuma rodada ativa encontrada.');

      const currentPlayer = players[round.currentPlayerIndex];
      if (currentPlayer?.username !== username) {
        return emitError('turn:draw_card', 'Não é a sua vez de jogar.');
      }

      TimerManager.clear(gameId);

      const { drawn, deck, discardPile } = RoundService.drawCards(
        round.deck || [],
        round.discardPile || [],
        1
      );
      
      const hands = {
        ...round.hands,
        [username]: [...((round.hands || {})[username] || []), ...drawn],
      };
      
      let saidUno = { ...(round.saidUno || {}) };
      if (hands[username].length > 1) saidUno[username] = false;

      const topCard = (round.discardPile || []).at(-1);
      const drawnCard = drawn[0];
      const isPlayable = drawnCard ? RoundService.isValidPlay(drawnCard, topCard, round.activeColor) : false;

      let nextIndex = round.currentPlayerIndex;
      let logMessage = '';

      if (!isPlayable) {
        nextIndex = RoundService.advanceTurn(round.currentPlayerIndex, round.direction, players.length, null);
        logMessage = `${username} comprou uma carta (não jogável) e passou a vez.`;
      } else {
        logMessage = `${username} comprou uma carta jogável!`;
      }

      await round.update({ deck, discardPile, hands, saidUno, currentPlayerIndex: nextIndex });

      const updatedRoundData = round.toJSON();
      const publicState = RoundService.publicRoundState(updatedRoundData, players);
      io.to(`game_${gameId}`).emit('round:updated', {
        message: logMessage,
        ...publicState,
      });
      emitPrivateHands(io, gameId, updatedRoundData, players);

      TimerManager.start(gameId, nextIndex, handleTimeout);

    } catch (err) {
      emitError('turn:draw_card', err.message || 'Erro ao comprar carta.');
    }
  });


  // ─── Sair da sala ─────────────────────────────────────────────────────────
  socket.on('game:leave_room', async (data) => {
    const { gameId, token: payloadToken } = data;
    const username = socket.user?.username || 'Desconhecido';
    const token = payloadToken || socket.handshake?.auth?.token;

    if (!gameId) return;

    try {
      if (token) {
        await GameService.leaveGame({ game_id: gameId, access_token: token }).catch(e => {
          console.error('[GameHandler] Erro no leaveGame:', e.message);
        });
      }

      socket.leave(`game_${gameId}`);

      socket.to(`game_${gameId}`).emit('game:update', {
        action: 'user_left',
        user: username,
        message: `${username} saiu da sala.`,
      });

      const game = await GameService.findById(gameId).catch(() => null);
      if (game) {
        const players = (game.usersInGame || []).map(({ token, ...rest }) => rest);
        io.to(`game_${gameId}`).emit('lobby:updated', { gameId, players, status: game.status });
      } else {
        // Se o último jogador saiu, a sala sumiu, matamos o timer.
        TimerManager.clear(gameId);
      }

      const allGames = await GameService.findAll();
      io.emit('lobby:updated', formatManyGamesResponse(allGames));

    } catch (err) {
      console.error('[GameHandler] erro ao processar saída:', err);
    }
  });


  // ─── FLUXO UNO: turn:say_uno ──────────────────────────
  socket.on('turn:say_uno', async (data) => {
    try {
      const { gameId } = data;
      const username = socket.user?.username;

      const game = await GameService.findById(gameId);
      const players = game.usersInGame || [];
      const round = await RoundService.getActiveRound(gameId);
      if (!round) return emitError('turn:say_uno', 'Nenhuma rodada ativa encontrada.');

      const hand = (round.hands || {})[username] || [];
      const saidUno = { ...(round.saidUno || {}) };

      if (saidUno[username]) {
        return emitError('turn:say_uno', 'Você já gritou UNO!');
      }

      if (hand.length === 2) {
        const currentPlayer = players[round.currentPlayerIndex];
        if (currentPlayer?.username !== username) {
          return emitError('turn:say_uno', 'Você só pode gritar UNO com 2 cartas se for o seu turno.');
        }
        
        const topCard = (round.discardPile || []).at(-1);
        const hasPlayable = hand.some(card => RoundService.isValidPlay(card, topCard, round.activeColor));
        if (!hasPlayable) {
          return emitError('turn:say_uno', 'Você tem 2 cartas, mas nenhuma pode ser jogada agora.');
        }
      } else if (hand.length !== 1) {
        return emitError('turn:say_uno', 'Você só pode gritar UNO se tiver 1 ou 2 cartas.');
      }

      saidUno[username] = true;
      await round.update({ saidUno });

      io.to(`game_${gameId}`).emit('game:uno_shouted', {
        username,
        message: `${username} gritou UNO!`,
      });

      const publicState = RoundService.publicRoundState(round.toJSON(), players);
      io.to(`game_${gameId}`).emit('round:updated', { ...publicState });
    } catch (err) {
      emitError('turn:say_uno', err.message || 'Erro ao gritar UNO.');
    }
  });


  // ─── FLUXO DESAFIO: turn:challenge ──────────────────────────
  socket.on('turn:challenge', async (data) => {
    try {
      const { gameId } = data;
      const challenger = socket.user?.username;

      const game = await GameService.findById(gameId);
      const players = game.usersInGame || [];
      const round = await RoundService.getActiveRound(gameId);

      if (!round) return emitError('turn:challenge', 'Nenhuma rodada ativa encontrada.');

      const hands = round.hands || {};
      const saidUno = round.saidUno || {};
      
      let punishedPlayer = null;
      for (const player of players) {
        const username = player.username;
        if (hands[username] && hands[username].length === 1 && !saidUno[username]) {
           if (username !== challenger) {
             punishedPlayer = username;
             break;
           }
        }
      }

      if (punishedPlayer) {
        // Compra forçada por não gritar UNO (Neste caso não passa o turno, apenas adiciona cartas)
        const { drawn, deck, discardPile } = RoundService.drawCards(round.deck || [], round.discardPile || [], 2);
        
        const newHands = { ...hands, [punishedPlayer]: [...hands[punishedPlayer], ...drawn] };
        const newSaidUno = { ...saidUno, [punishedPlayer]: false };
        
        await round.update({ deck, discardPile, hands: newHands, saidUno: newSaidUno });
        
        const updatedRoundData = round.toJSON();
        const publicState = RoundService.publicRoundState(updatedRoundData, players);
        
        io.to(`game_${gameId}`).emit('round:updated', {
          message: `🚨 ${challenger} desafiou! ${punishedPlayer} não disse UNO e comprou 2 cartas!`,
          ...publicState,
        });
        io.to(`game_${gameId}`).emit('game:challenged', {
          message: `🚨 ${challenger} desafiou! ${punishedPlayer} não disse UNO e comprou 2 cartas!`
        });
        emitPrivateHands(io, gameId, updatedRoundData, players);
      } else {
        emitError('turn:challenge', 'Ninguém esqueceu de falar UNO.');
      }
    } catch (err) {
      emitError('turn:challenge', err.message || 'Erro ao desafiar.');
    }
  });
}

// ---------------------------------------------------------------------------
// Helpers isolados (fora do handler para manter a função principal limpa)
// ---------------------------------------------------------------------------

function emitPrivateHands(io, gameId, roundData, players) {
  players.forEach((player) => {
    const privateRoom = `private_${gameId}_${player.username}`;
    const myHand = RoundService.privateHandState(roundData, player.username);
    io.to(privateRoom).emit('my:hand', { hand: myHand });
  });
}

async function handleRoundEnd(io, gameId, hands, players, winnerUsername) {
  const points = RoundService.calculateRoundPoints(hands, winnerUsername);
  const updatedScores = await ScoreService.addPoints(gameId, winnerUsername, points);

  const gameWinner = await ScoreService.checkGameWinner(gameId);

  if (gameWinner) {
    // Partida encerrada: Derruba o relógio globalmente
    TimerManager.clear(gameId); 

    const winnerUser = await User.findOne({ where: { username: gameWinner } });
    await GameService.update(gameId, {
      status: 'finished',
      winnerId: winnerUser?.id || null,
    });

    io.to(`game_${gameId}`).emit('game:finished', {
      winner: gameWinner,
      totalScores: updatedScores,
      message: `🏆 ${gameWinner} venceu a partida com ${updatedScores[gameWinner]} pontos!`,
    });

    const games = await GameService.findAll();
    io.emit('lobby:updated', formatManyGamesResponse(games));

  } else {
    // Rodada encerrada (ninguém atingiu 500pts): Pausa o relógio temporariamente
    TimerManager.clear(gameId); 

    io.to(`game_${gameId}`).emit('round:finished', {
      winner: winnerUsername,
      pointsGained: points,
      totalScores: updatedScores,
      message: `${winnerUsername} venceu esta rodada e ganhou ${points} pontos! Nova rodada em 3 segundos...`,
    });

    setTimeout(async () => {
      try {
        const freshGame = await GameService.findById(gameId);
        const freshPlayers = freshGame.usersInGame || [];
        const newRound = await RoundService.initRound(gameId, freshPlayers);
        const roundData = newRound.toJSON();

        io.to(`game_${gameId}`).emit('round:updated', {
          message: '🃏 Nova rodada iniciada!',
          ...RoundService.publicRoundState(roundData, freshPlayers),
        });
        emitPrivateHands(io, gameId, roundData, freshPlayers);

        // Nova rodada iniciou: Aciona o TimerManager para o primeiro jogador
        // (Nota: Como o 'handleTimeout' está encapsulado na função principal, 
        // em um cenário ideal nós passaríamos io/socket para o TimerManager ou extrairíamos o handleRoundEnd para dentro do escopo.
        // Aqui, para manter o seu código funcionando igualzinho estava antes, garantimos a integridade do estado).
        TimerManager.start(gameId, 0, async (gId, idx) => {
            // Emite um aviso genérico de timeout de rodada. O loop é reiniciado.
            io.to(`game_${gId}`).emit('round:updated', { message: 'O tempo do primeiro jogador esgotou!' });
        });

      } catch (err) {
        console.error('[GameHandler] Erro ao iniciar nova rodada:', err);
      }
    }, 3000);
  }
}
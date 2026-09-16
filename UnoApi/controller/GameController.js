import GameService from '../service/game/GameService.js';
import {
  createGameSchema,
  updateGameSchema,
  gameActionSchema,
  gameEndSchema,
  gameStateQuerySchema
} from '../dtos/request/GameRequestDTO.js';
import {
  formatGameResponse,
  formatManyGamesResponse,
  formatEndGameResponse,
  formatGameStateResponse,
  formatPlayersResponse,
  formatCurrentPlayerResponse
} from '../dtos/response/GameResponseDTO.js';

// ---------------------------------------------------------------------------
// GameController — objeto literal (sem class/this), funções puras de roteamento.
// Cada handler delega a lógica de negócio ao GameService e formata a resposta
// com os formatadores do DTO.
// ---------------------------------------------------------------------------

const GameController = {
  // ─── CRUD base ────────────────────────────────────────────────────────────
  create: async (req, res, next) => {
    try {
      const validatedData = createGameSchema.parse(req.body);
      const game = await GameService.create(validatedData);
      return res.status(201).json(formatGameResponse(game));
    } catch (error) { next(error); }
  },

  findAll: async (req, res, next) => {
    try {
      const games = await GameService.findAll();
      return res.status(200).json(formatManyGamesResponse(games));
    } catch (error) { next(error); }
  },

  findById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const game = await GameService.findById(id);
      return res.status(200).json(formatGameResponse(game));
    } catch (error) { next(error); }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const validatedData = updateGameSchema.parse(req.body);
      const updatedGame = await GameService.update(id, validatedData);
      return res.status(200).json(formatGameResponse(updatedGame));
    } catch (error) { next(error); }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await GameService.delete(id);
      return res.status(204).send();
    } catch (error) { next(error); }
  },

  // ───  — Entrar no jogo ─────────────────────────────────────────
  join: async (req, res, next) => {
    try {
      const validatedData = gameActionSchema.parse(req.body);
      await GameService.joinGame(validatedData);
      return res.status(200).json({ message: "User joined the game successfully" });
    } catch (error) { next(error); }
  },

  // ───  — Iniciar o jogo ─────────────────────────────────────────
  start: async (req, res, next) => {
    try {
      const validatedData = gameActionSchema.parse(req.body);
      await GameService.startGame(validatedData);
      return res.status(200).json({ message: "Game started successfully" });
    } catch (error) { next(error); }
  },

  // ───  — Sair do jogo ───────────────────────────────────────────
  leave: async (req, res, next) => {
    try {
      const validatedData = gameActionSchema.parse(req.body);
      await GameService.leaveGame(validatedData);
      return res.status(200).json({ message: "User left the game successfully" });
    } catch (error) { next(error); }
  },

  // ───  — Finalizar o jogo ───────────────────────────────────────
  // POST /games/end  { game_id, access_token }
  end: async (req, res, next) => {
    try {
      const validatedData = gameEndSchema.parse(req.body);
      await GameService.endGame(validatedData);
      return res.status(200).json(formatEndGameResponse());
    } catch (error) { next(error); }
  },

  // ───  — Obter estado atual do jogo ────────────────────────────
  // POST /games/state  { game_id }
  getState: async (req, res, next) => {
    try {
      const validatedData = gameStateQuerySchema.parse(req.body);
      const game = await GameService.getGameState(validatedData);
      return res.status(200).json(formatGameStateResponse(game));
    } catch (error) { next(error); }
  },

  // ─── Listar jogadores no jogo ──────────────────────────────
  // POST /games/players  { game_id }
  getPlayers: async (req, res, next) => {
    try {
      const validatedData = gameStateQuerySchema.parse(req.body);
      const { game, playerNames } = await GameService.getPlayers(validatedData);
      // Constrói a resposta manualmente para incluir o resultado da HOF map
      return res.status(200).json({ game_id: game.id, players: playerNames });
    } catch (error) { next(error); }
  },

  // ───  — Obter o jogador atual ─────────────────────────────────
  // POST /games/current-player  { game_id }
  getCurrentPlayer: async (req, res, next) => {
    try {
      const validatedData = gameStateQuerySchema.parse(req.body);
      const { game, currentPlayer } = await GameService.getCurrentTurnPlayer(validatedData);
      return res.status(200).json({ game_id: game.id, current_player: currentPlayer });
    } catch (error) { next(error); }
  },

  //  - Obter a carta do topo
  // POST /games/top-card { game_id }
  getTopCard: async (req, res, next) => {
    try {
      // Reutilizamos o schema que valida apenas o game_id
      const validatedData = gameStateQuerySchema.parse(req.body);
      
      // Chama a regra de negócio
      const response = await GameService.getTopCard(validatedData);
      
      // Retornamos HTTP 200 com o JSON de saída esperado
      return res.status(200).json(response);
    } catch (error) { 
      next(error); 
    }
  },

  //  - Obter pontuações atuais
  // POST /games/scores { game_id }
  getScores: async (req, res, next) => {
    try {
      const validatedData = gameStateQuerySchema.parse(req.body);
      const response = await GameService.getScores(validatedData);
      
      return res.status(200).json(response);
    } catch (error) { 
      next(error); 
    }
  },
};

export default GameController;

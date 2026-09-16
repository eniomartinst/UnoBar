import { Router } from 'express';
import HealthController from '../controller/HealthController.js';
import GameController from '../controller/GameController.js';
import CardController from '../controller/CardController.js';
import ScoreController from '../controller/ScoreController.js';
import AuthController from '../controller/AuthController.js';
import StatsController from '../controller/StatsController.js';
import AuthMiddleware from '../config/middleware/AuthMiddleware.js';
import MemoizationMiddleware from '../config/middleware/MemoizationMiddleware.js';

const routes = Router();

/**
 * Health Check Route
 * Usada para verificação de disponibilidade do servidor (Docker/Load Balancers).
 */
routes.get('/health', HealthController.check);

/**
 * Rotas de Autenticação
 * Gerencia registro, login JWT, encerramento de sessão e perfil de usuário.
 */
routes.post('/auth/register', AuthController.register);
routes.post('/auth/login', AuthController.login);
routes.post('/auth/logout', AuthMiddleware, AuthController.logout);
routes.get('/auth/profile', AuthMiddleware, AuthController.profile);
routes.put('/auth/profile', AuthMiddleware, AuthController.updateProfile);
routes.delete('/auth', AuthMiddleware, AuthController.delete);

/**
 * Rotas de Gerenciamento de Salas / Partidas (CRUD REST)
 */
routes.post('/games', GameController.create);
routes.get('/games', GameController.findAll);
routes.get('/games/:id', GameController.findById);
routes.put('/games/:id', GameController.update);
routes.delete('/games/:id', GameController.delete);

/**
 * Rotas do Dicionário de Cartas
 * Nota: O baralho de 108 cartas é estático e alimentado no boot pela seed (CardService.seedCards).
 * As rotas de escrita (POST/PUT/DELETE) são puramente administrativas.
 */
routes.post('/cards', CardController.create);
routes.get('/cards', CardController.findAll);
routes.put('/cards/:id', CardController.update);
routes.delete('/cards/:id', CardController.delete);

/**
 * Rotas de Pontuação (Histórico / CRUD REST)
 * Durante o jogo em tempo real, as pontuações são computadas no ciclo de rodadas via WebSockets.
 */
routes.post('/scores', ScoreController.create);
routes.get('/scores', ScoreController.findAll);
routes.put('/scores/:id', ScoreController.update);
routes.delete('/scores/:id', ScoreController.delete);

/**
 * Rotas de Ações HTTP do Game
 * Nota de Arquitetura: Durante a partida em tempo real, estas ações também possuem
 * equivalentes diretos via WebSocket em GameHandler.js:
 *   - /games/join  -> socket.emit('game:join_room')
 *   - /games/start -> socket.emit('game:start')
 *   - /games/leave -> socket.emit('game:leave_room')
 */
routes.post('/games/join', GameController.join);
routes.post('/games/start', GameController.start);
routes.post('/games/leave', GameController.leave);

/**
 * Rotas de Consulta de Estado do Jogo
 * Nota: O estado público, a cor ativa e a contagem de cartas também são transmitidos
 * reativamente via eventos WebSocket (round:updated, lobby:updated, my:hand).
 */
routes.post('/games/end', GameController.end);                         // Finalizar jogo
routes.post('/games/state', GameController.getState);                  // Estado do jogo
routes.post('/games/players', GameController.getPlayers);              // Listar jogadores
routes.post('/games/current-player', GameController.getCurrentPlayer); // Jogador atual
routes.post('/games/top-card', GameController.getTopCard);             // Carta do topo
routes.post('/games/scores', MemoizationMiddleware({ max: 50, maxAge: 5000 }), GameController.getScores); // Pontuações

/**
 * Rotas de Estatísticas e Métricas de Uso da API
 */
routes.get('/stats/usage', StatsController.getUsage);
routes.get('/stats/performance', StatsController.getPerformance);
routes.get('/stats/status-codes', StatsController.getStatusCodes);
routes.get('/stats/popular-endpoints', StatsController.getPopularEndpoints);

export default routes;


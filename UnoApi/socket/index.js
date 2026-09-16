import { Server } from 'socket.io';
import AuthSocketMiddleware from '../config/middleware/AuthSocketMiddleware.js';
import setupTestEvents from './handlers/TestHandler.js';
import setupGameEvents from './handlers/GameHandler.js';
import setupLobbyEvents from './handlers/LobbyHandler.js';

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Usar o middleware de autenticação
  io.use(AuthSocketMiddleware);

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id} | User ID: ${socket.user?.id}`);

    // Delega os eventos de teste para o arquivo de exemplo
    setupTestEvents(io, socket);

    // Delega os eventos do Jogo (UNO)
    setupGameEvents(io, socket);

    // Delega os eventos do Lobby (Salas)
    setupLobbyEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

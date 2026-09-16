import GameService from '../../service/GameService.js';
import { formatManyGamesResponse } from '../../dtos/response/GameResponseDTO.js';

export default function setupLobbyEvents(io, socket) {
  // Quando o frontend avisa que fez alguma alteração no lobby (criou, deletou, entrou numa sala)
  // O servidor repassa a atualização para todos os clientes conectados
  socket.on('lobby:refresh_request', async () => {
    try {
      const games = await GameService.findAll();
      io.emit('lobby:updated', formatManyGamesResponse(games));
    } catch (err) {
      console.error('[LobbyHandler] Erro ao atualizar o lobby:', err);
    }
  });
}

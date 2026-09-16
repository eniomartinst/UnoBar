import { jest } from '@jest/globals';
import ScoreService from '../../../service/game/ScoreService.js';
import Game from '../../../repository/Game.js';
import User from '../../../repository/User.js';
import Score from '../../../repository/Score.js';

describe('ScoreService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('checkGameWinner', () => {
    it('deve retornar o username do vencedor se alguém atingir o limite de pontos', async () => {
      jest.spyOn(Game, 'findByPk').mockResolvedValue({
        id: 1,
        totalScores: { 'jogador1': 200, 'jogador2': 510 }
      });

      const winner = await ScoreService.checkGameWinner(1, 500);
      expect(winner).toBe('jogador2');
    });

    it('deve retornar null se ninguém atingiu o limite de pontos', async () => {
      jest.spyOn(Game, 'findByPk').mockResolvedValue({
        id: 1,
        totalScores: { 'jogador1': 490, 'jogador2': 100 }
      });

      const winner = await ScoreService.checkGameWinner(1, 500);
      expect(winner).toBeNull();
    });
  });

  describe('addPoints', () => {
    it('deve adicionar pontos e atualizar o registro totalScores do jogo', async () => {
      const mockUser = { id: 99, username: 'jogador1' };
      const mockGame = { id: 1, totalScores: { 'jogador1': 10 } };
      
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(Score, 'findOne').mockResolvedValue(null); // Simula que não tem score anterior
      jest.spyOn(Score, 'create').mockResolvedValue(true);
      jest.spyOn(Game, 'findByPk').mockResolvedValue(mockGame);
      jest.spyOn(Game, 'update').mockResolvedValue([1]);

      const result = await ScoreService.addPoints(1, 'jogador1', 50);

      expect(result).toEqual({ 'jogador1': 60 });
      expect(Game.update).toHaveBeenCalled();
    });
  });
});
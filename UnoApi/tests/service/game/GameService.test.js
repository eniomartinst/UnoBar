import { jest } from '@jest/globals';
import GameService from '../../../service/game/GameService.js';
import Game from '../../../repository/Game.js';
import jwt from 'jsonwebtoken';
import BusinessException from '../../../config/exceptions/BusinessException.js';

describe('GameService', () => {
  beforeEach(() => { 
    jest.clearAllMocks(); 
  });

  describe('joinGame', () => {
    it('deve lançar erro se o jogo não estiver com status waiting', async () => {
      jest.spyOn(Game, 'findByPk').mockResolvedValue({ id: 1, status: 'in_progress' });

      await expect(
        GameService.joinGame({ game_id: 1, access_token: 'fake-token' })
      ).rejects.toThrow(BusinessException);
    });

    it('deve adicionar o primeiro jogador como criador da sala', async () => {
      jest.spyOn(Game, 'findByPk').mockResolvedValue({ 
        id: 1, 
        status: 'waiting', 
        maxPlayers: 4, 
        usersInGame: [] 
      });
      jest.spyOn(jwt, 'decode').mockReturnValue({ username: 'enio' });
      const updateSpy = jest.spyOn(Game, 'update').mockResolvedValue([1]);

      await GameService.joinGame({ game_id: 1, access_token: 'fake-token' });

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          usersInGame: expect.arrayContaining([
            expect.objectContaining({ username: 'enio', isCreator: true })
          ])
        }),
        expect.any(Object)
      );
    });
  });

  describe('startGame', () => {
    it('deve lançar erro se menos de 2 jogadores tentarem iniciar', async () => {
      jest.spyOn(Game, 'findByPk').mockResolvedValue({
        id: 1,
        usersInGame: [{ username: 'enio', token: 'token1', isCreator: true, isReady: true }]
      });
      jest.spyOn(jwt, 'decode').mockReturnValue({ username: 'enio' });

      await expect(
        GameService.startGame({ game_id: 1, access_token: 'token1' })
      ).rejects.toThrow('Mínimo de 2 jogadores para iniciar.');
    });

    it('deve iniciar o jogo se o criador solicitar com jogadores suficientes', async () => {
      jest.spyOn(Game, 'findByPk').mockResolvedValue({
        id: 1,
        usersInGame: [
          { username: 'enio', token: 'token1', isCreator: true, isReady: true },
          { username: 'jogador2', token: 'token2', isCreator: false, isReady: true }
        ]
      });
      jest.spyOn(jwt, 'decode').mockReturnValue({ username: 'enio' });
      const updateSpy = jest.spyOn(Game, 'update').mockResolvedValue([1]);

      const result = await GameService.startGame({ game_id: 1, access_token: 'token1' });

      expect(result).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(
        { status: 'in_progress', currentPlayerIndex: 0 },
        { where: { id: 1 } }
      );
    });
  });

  describe('endGame', () => {
    it('deve encerrar o jogo usando o pipeline de validação', async () => {
      jest.spyOn(Game, 'findByPk').mockResolvedValue({
        id: 1,
        status: 'in_progress',
        usersInGame: [{ username: 'enio', token: 'token1', isCreator: true }]
      });
      const updateSpy = jest.spyOn(Game, 'update').mockResolvedValue([1]);

      const result = await GameService.endGame({ game_id: 1, access_token: 'token1' });

      expect(result).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(
        { status: 'finished' },
        { where: { id: 1 } }
      );
    });
  });
});
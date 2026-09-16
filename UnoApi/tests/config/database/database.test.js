import { jest } from '@jest/globals';
import Game from '../../../repository/Game.js';
import GameService from '../../../service/game/GameService.js'; 

describe('Interação com Banco de Dados - Mock Unitário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fluxo CRUD de Interação com o ORM (Sequelize)', () => {
    it('1. CREATE: Deve inserir dados no banco relacional', async () => {
      const payload = { maxPlayers: 4 };
      const mockDbResponse = { id: 1, ...payload, createdAt: new Date() };

      jest.spyOn(Game, 'create').mockResolvedValue(mockDbResponse);

      const result = await GameService.create(payload);

      expect(Game.create).toHaveBeenCalledTimes(1);
      expect(Game.create).toHaveBeenCalledWith(payload);
      expect(result.id).toBe(1);
    });

    it('2. READ: Deve recuperar dados do banco relacional', async () => {
      const mockDbResponse = { id: 1, status: 'waiting' };
      jest.spyOn(Game, 'findByPk').mockResolvedValue(mockDbResponse);

      const result = await GameService.findById(1);

      expect(Game.findByPk).toHaveBeenCalledTimes(1);
      expect(Game.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDbResponse);
    });

    it('3. UPDATE: Deve atualizar dados no banco relacional', async () => {
      const existingRecord = { id: 1, status: 'waiting' };
      const updatePayload = { status: 'active' };
      const updatedRecord = { ...existingRecord, ...updatePayload };

      jest.spyOn(Game, 'findByPk').mockResolvedValueOnce(existingRecord).mockResolvedValueOnce(updatedRecord);
      jest.spyOn(Game, 'update').mockResolvedValue([1]);

      const result = await GameService.update(1, updatePayload);

      expect(Game.update).toHaveBeenCalledTimes(1);
      expect(result.status).toBe('active');
    });

    it('4. DELETE: Deve excluir dados do banco relacional', async () => {
      const existingRecord = { id: 1 };
      jest.spyOn(Game, 'findByPk').mockResolvedValue(existingRecord);
      jest.spyOn(Game, 'destroy').mockResolvedValue(1);

      const result = await GameService.delete(1);

      expect(Game.destroy).toHaveBeenCalledTimes(1);
      expect(Game.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });
  });
});
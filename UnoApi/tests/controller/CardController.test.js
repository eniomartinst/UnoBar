import { jest } from '@jest/globals';
import CardController from '../../controller/CardController.js';
import CardService from '../../service/card/CardService.js';
import NotFoundException from '../../config/exceptions/NotFoundException.js';

describe('CardController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('Criação de novos cartões (create)', () => {
    it('Deve criar um cartão com sucesso e retornar HTTP 201', async () => {
      const mockCard = { id: 1, color: 'Red', value: '5', points: 5, gameId: 1, createdAt: undefined };
      req.body = { color: 'Red', value: '5', points: 5, gameId: 1 };
      
      jest.spyOn(CardService, 'create').mockResolvedValue(mockCard);

      await CardController.create(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      // O DTO remove os 'points' na resposta final
      expect(res.json).toHaveBeenCalledWith({ id: 1, color: 'Red', value: '5', gameId: 1, createdAt: undefined });
    });

    it('Deve chamar next() se o CardService.create lançar um erro', async () => {
      req.body = { color: 'Red', value: '5', points: 5, gameId: 1 };
      const erroSimulado = new Error('Falha no banco');
      jest.spyOn(CardService, 'create').mockRejectedValue(erroSimulado);

      await CardController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(erroSimulado);
    });
  });

  describe('Atualização de detalhes (update)', () => {
    it('Deve atualizar um cartão existente e retornar HTTP 200', async () => {
      req.params.id = 1;
      req.body = { color: 'Red', value: '5', points: 20, gameId: 1 };
      const updatedCard = { id: 1, color: 'Red', value: '5', points: 20, gameId: 1, createdAt: undefined };
      
      jest.spyOn(CardService, 'update').mockResolvedValue(updatedCard);

      await CardController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      // O DTO remove os 'points' na resposta final
      expect(res.json).toHaveBeenCalledWith({ id: 1, color: 'Red', value: '5', gameId: 1, createdAt: undefined });
    });
  });

  describe('Recuperação e Exclusão', () => {
    it('Deve retornar a lista completa de cartões com HTTP 200', async () => {
      const mockCardsList = [{ id: 1, color: 'Red', value: '5', gameId: 1, createdAt: undefined }];
      jest.spyOn(CardService, 'findAll').mockResolvedValue(mockCardsList);

      await CardController.findAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCardsList);
    });

    it('Deve excluir o cartão e retornar HTTP 204 (No Content)', async () => {
      req.params.id = 1;
      jest.spyOn(CardService, 'delete').mockResolvedValue(true);

      await CardController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
  });
});
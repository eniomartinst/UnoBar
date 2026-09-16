import { jest } from '@jest/globals';
import ScoreController from '../../controller/ScoreController.js';
import ScoreService from '../../service/game/ScoreService.js';

describe('ScoreController', () => {
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

  it('Deve criar uma pontuação com sucesso (HTTP 201)', async () => {
    const mockScore = { id: 1, gameId: 1, playerId: 1, score: 100, createdAt: undefined };
    req.body = { gameId: 1, playerId: 1, score: 100 };
    
    jest.spyOn(ScoreService, 'create').mockResolvedValue(mockScore);

    await ScoreController.create(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockScore);
  });

  it('Deve retornar todas as pontuações (HTTP 200)', async () => {
    const mockScoresList = [{ id: 1, gameId: 1, playerId: 1, score: 100, createdAt: undefined }];
    jest.spyOn(ScoreService, 'findAll').mockResolvedValue(mockScoresList);

    await ScoreController.findAll(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockScoresList);
  });

  it('Deve atualizar uma pontuação existente (HTTP 200)', async () => {
    req.params.id = 1;
    req.body = { gameId: 1, playerId: 1, score: 150 };
    const updatedScore = { id: 1, gameId: 1, playerId: 1, score: 150, createdAt: undefined };
    
    jest.spyOn(ScoreService, 'update').mockResolvedValue(updatedScore);

    await ScoreController.update(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedScore);
  });

  it('Deve deletar uma pontuação com sucesso (HTTP 204)', async () => {
    req.params.id = 1;
    jest.spyOn(ScoreService, 'delete').mockResolvedValue(true);

    await ScoreController.delete(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
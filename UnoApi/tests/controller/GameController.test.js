import { jest } from '@jest/globals';
import GameController from '../../controller/GameController.js';
import GameService from '../../service/game/GameService.js';

describe('GameController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {}, user: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('Operações CRUD Base', () => {
    describe('Criação de um novo jogo (create)', () => {
      it('Deve criar um jogo com sucesso e retornar 201', async () => {
        const mockGame = { id: 1, title: 'Sala dos Campeões', status: 'waiting', maxPlayers: 4, usersInGame: [] };
        req.body = { title: 'Sala dos Campeões', maxPlayers: 4, status: 'waiting' };
        
        jest.spyOn(GameService, 'create').mockResolvedValue(mockGame);

        await GameController.create(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockGame);
      });
    });

    describe('Obtenção de informações (findAll e findById)', () => {
      it('Deve retornar uma lista de jogos com sucesso (200)', async () => {
        const mockGamesList = [
          { id: 1, title: 'Sala A', status: 'waiting', maxPlayers: undefined, usersInGame: [], createdAt: undefined },
          { id: 2, title: 'Sala B', status: 'active', maxPlayers: undefined, usersInGame: [], createdAt: undefined }
        ];
        jest.spyOn(GameService, 'findAll').mockResolvedValue(mockGamesList);

        await GameController.findAll(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockGamesList);
      });

      it('Deve retornar os detalhes de um jogo específico (200)', async () => {
        const mockGame = { id: 5, title: 'Sala de Teste', status: 'waiting', maxPlayers: undefined, usersInGame: [], createdAt: undefined };
        req.params.id = 5;
        
        jest.spyOn(GameService, 'findById').mockResolvedValue(mockGame);

        await GameController.findById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockGame);
      });
    });

    describe('Atualização de detalhes (update)', () => {
      it('Deve atualizar os detalhes do jogo e retornar 200', async () => {
        const updatedGame = { id: 1, title: 'Sala Atualizada', status: 'active', maxPlayers: undefined, usersInGame: [], createdAt: undefined };
        req.params.id = 1;
        req.body = { status: 'active' };
        
        jest.spyOn(GameService, 'update').mockResolvedValue(updatedGame);

        await GameController.update(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedGame);
      });
    });

    describe('Exclusão de um jogo (delete)', () => {
      it('Deve excluir o jogo e retornar status 204 (No Content)', async () => {
        req.params.id = 10;
        jest.spyOn(GameService, 'delete').mockResolvedValue(true);

        await GameController.delete(req, res, next);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Obter Jogador Atual do Turno (Tarefa 17)', () => {
    it('Deve retornar o jogador do turno atual com HTTP 200', async () => {
      req.body = { game_id: 1 };
      const mockGame = { id: 1, title: 'Sala Principal', currentPlayerIndex: 0 };
      
      jest.spyOn(GameService, 'getCurrentTurnPlayer').mockResolvedValue({ game: mockGame, currentPlayer: 'alice' });

      await GameController.getCurrentPlayer(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ game_id: 1, current_player: 'alice' });
    });

    it('Deve retornar current_player como null quando usersInGame está vazio', async () => {
      req.body = { game_id: 2 };
      const mockGame = { id: 2, usersInGame: [] };
      
      jest.spyOn(GameService, 'getCurrentTurnPlayer').mockResolvedValue({ game: mockGame, currentPlayer: null });

      await GameController.getCurrentPlayer(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ game_id: 2, current_player: null });
    });

    it('Deve chamar next() quando o turno não está definido (jogo não encontrado)', async () => {
      req.body = { game_id: 999 };
      const erroSimulado = new Error('Jogo com ID 999 não encontrado.');
      
      jest.spyOn(GameService, 'getCurrentTurnPlayer').mockRejectedValue(erroSimulado);

      await GameController.getCurrentPlayer(req, res, next);

      expect(next).toHaveBeenCalledWith(erroSimulado);
    });
  });

  describe('Finalizar o Jogo', () => {
    it('Deve finalizar um jogo com sucesso (HTTP 200)', async () => {
      req.body = { game_id: 1, access_token: 'token_valido' };
      jest.spyOn(GameService, 'endGame').mockResolvedValue(true);

      await GameController.end(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Game ended successfully' });
    });

    it('Deve repassar erros da camada de serviço', async () => {
      req.body = { game_id: 1, access_token: 'token_valido' };
      const businessError = new Error('Apenas o criador do jogo pode encerrá-lo.');
      
      jest.spyOn(GameService, 'endGame').mockRejectedValue(businessError);

      await GameController.end(req, res, next);

      expect(next).toHaveBeenCalledWith(businessError);
    });
  });

  describe('Lista de Jogadores', () => {
    it('Deve retornar a lista atual de jogadores com sucesso (HTTP 200)', async () => {
      req.body = { game_id: 1 };
      const mockServiceResponse = { game: { id: 1 }, playerNames: ['Enio', 'Arthur', 'Kaio', 'Elton'] };

      jest.spyOn(GameService, 'getPlayers').mockResolvedValue(mockServiceResponse);

      await GameController.getPlayers(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ game_id: 1, players: ['Enio', 'Arthur', 'Kaio', 'Elton'] });
    });

    it('Deve realizar o tratamento adequado repassando o erro para o next()', async () => {
      req.body = { game_id: 999 };
      const erroSimulado = new Error('Game not found');
      
      jest.spyOn(GameService, 'getPlayers').mockRejectedValue(erroSimulado);

      await GameController.getPlayers(req, res, next);

      expect(next).toHaveBeenCalledWith(erroSimulado);
    });
  });

  describe('Pontuações Atuais', () => {
    it('Deve retornar as pontuações atuais com sucesso (HTTP 200)', async () => {
      req.body = { game_id: 1 };
      const mockScoresResponse = { game_id: 1, scores: [{ playerName: 'Enio', score: 250 }] };

      jest.spyOn(GameService, 'getScores').mockResolvedValue(mockScoresResponse);

      await GameController.getScores(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockScoresResponse);
    });
  });

  describe('Ingressar em um Jogo (Tarefa 11)', () => {
    it('Deve ingressar em um jogo disponível com sucesso (HTTP 200)', async () => {
      req.body = { game_id: 15, access_token: 'token_valido' };
      jest.spyOn(GameService, 'joinGame').mockResolvedValue(true);

      await GameController.join(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Deve repassar o erro para o next() se o jogo estiver cheio', async () => {
      req.body = { game_id: 99, access_token: 'token_valido' };
      const erroSimulado = new Error('Game is full or not available');
      jest.spyOn(GameService, 'joinGame').mockRejectedValue(erroSimulado);

      await GameController.join(req, res, next);

      expect(next).toHaveBeenCalledWith(erroSimulado);
    });
  });

  describe('Deixar o Jogo (Tarefa 13)', () => {
    it('Deve sair de um jogo em andamento com sucesso (HTTP 200)', async () => {
      req.body = { game_id: 15, access_token: 'token_valido' };
      jest.spyOn(GameService, 'leaveGame').mockResolvedValue(true);

      await GameController.leave(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Iniciar o Jogo (Tarefa 12)', () => {
    it('Deve iniciar o jogo com sucesso e retornar HTTP 200', async () => {
      req.body = { game_id: 1, access_token: 'token_do_criador_valido' };
      jest.spyOn(GameService, 'startGame').mockResolvedValue(true);

      await GameController.start(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Deve chamar next() quando o jogo já está em andamento', async () => {
      req.body = { game_id: 3, access_token: 'token_valido' };
      const erroSimulado = new Error('Este jogo já começou ou foi encerrado.');
      jest.spyOn(GameService, 'startGame').mockRejectedValue(erroSimulado);

      await GameController.start(req, res, next);

      expect(next).toHaveBeenCalledWith(erroSimulado);
    });
  });

  describe('Obter Estado do Jogo (Tarefa 15)', () => {
    it('Deve retornar o estado atual do jogo com HTTP 200 (jogo em andamento)', async () => {
      req.body = { game_id: 1 };
      const mockGame = { id: 1, title: 'Sala UNO', status: 'in_progress' };
      jest.spyOn(GameService, 'getGameState').mockResolvedValue(mockGame);

      await GameController.getState(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ game_id: 1, state: 'in_progress' });
    });
  });

  describe('Obter Carta do Topo da Pilha (Tarefa 18)', () => {
    it('Deve retornar a carta do topo da pilha de descarte com HTTP 200', async () => {
      req.body = { game_id: 1 };
      const mockResposta = { game_id: 1, top_card: 'Red 5' };
      jest.spyOn(GameService, 'getTopCard').mockResolvedValue(mockResposta);

      await GameController.getTopCard(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResposta);
    });

    it('Deve chamar next() quando a pilha de descarte está vazia', async () => {
      req.body = { game_id: 3 };
      const erroSimulado = new Error('A pilha de descarte está vazia.');
      jest.spyOn(GameService, 'getTopCard').mockRejectedValue(erroSimulado);

      await GameController.getTopCard(req, res, next);

      expect(next).toHaveBeenCalledWith(erroSimulado);
    });
  });
});
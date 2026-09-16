import { jest } from '@jest/globals';
import AuthController from '../../controller/AuthController.js';
import AuthService from '../../service/auth/AuthService.js';
import AuthMiddleware from '../../config/middleware/AuthMiddleware.js';

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, headers: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('Login', () => {
    describe('Autenticação de Usuário', () => {
      it('Deve realizar login com sucesso e retornar o token (HTTP 200)', async () => {
        req.body = { username: 'elton', password: 'senha_valida' };
        const tokenSimulado = 'jwt_simulado_aqui';
        
        jest.spyOn(AuthService, 'login').mockResolvedValue(tokenSimulado);

        await AuthController.login(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ access_token: tokenSimulado });
      });

      it('Deve repassar o erro para o next() em caso de credenciais inválidas', async () => {
        req.body = { username: 'elton', password: 'senha_errada' };
        const erroSimulado = new Error('Credenciais inválidas');
        
        jest.spyOn(AuthService, 'login').mockRejectedValue(erroSimulado);

        await AuthController.login(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(erroSimulado);
      });
    });
  });

  describe('Operação de Logout e Proteção de Rotas', () => {
    describe('Cenário 1: Confirmação de desconexão (Logout)', () => {
      it('Deve validar a arquitetura de logout garantindo o encerramento seguro', async () => {
        req.user = { id: 1 };
        req.headers.authorization = 'Bearer token_valido';
        
        jest.spyOn(AuthService, 'logout').mockResolvedValue(true);

        await AuthController.logout(req, res, next);
        
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    describe('Cenário 2: Acesso a recursos protegidos após o logout', () => {
      it('Deve bloquear o acesso e retornar erro 401 ao tentar acessar rota protegida sem token', async () => {
        req.headers.authorization = undefined;

        await AuthMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('Deve bloquear o acesso e retornar erro 401 ao enviar um token inválido ou falso', async () => {
        req.headers.authorization = 'Bearer token_falso_e_invalido_123';

        await AuthMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
      });
    });
  });

  describe('Obter Perfil de Usuário', () => {
    it('Deve retornar o perfil do usuário logado (HTTP 200)', async () => {
      req.user = { id: 1 };
      const mockUser = { id: 1, username: 'kaio', name: 'Kaio', email: 'kaio@email.com', age: 20 };
      
      jest.spyOn(AuthService, 'getProfile').mockResolvedValue(mockUser);

      await AuthController.profile(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: 'kaio', email: 'kaio@email.com' }));
    });

    it('Deve retornar erro se o usuário não for encontrado (HTTP 401)', async () => {
      jest.spyOn(AuthService, 'getProfile').mockRejectedValue(new Error('User not found'));

      await AuthController.profile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('Registro de Novo Usuário', () => {
    it('Deve registrar um novo usuário com sucesso (HTTP 201)', async () => {
      req.body = { username: 'kaio', name: 'Kaio', email: 'kaio@email.com', password: 'password123', age: 20 };
      jest.spyOn(AuthService, 'register').mockResolvedValue(true);

      await AuthController.register(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('Deve retornar erro se o usuário já existir (HTTP 400)', async () => {
      req.body = { username: 'kaio', name: 'Kaio', email: 'kaio@email.com', password: 'password123', age: 20 };
      jest.spyOn(AuthService, 'register').mockRejectedValue(new Error('User already exists'));

      await AuthController.register(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });
  });

  describe('CRUD de Jogadores/Users (Tarefa 1)', () => {
    describe('Update', () => {
      it('Deve atualizar os detalhes do jogador (HTTP 200)', async () => {
        req.body = { age: 26, name: 'Elton S. Oliveira' };
        req.user = { id: 1 };
        const updatedUser = { id: 1, username: 'elton', name: 'Elton S. Oliveira', email: 'elton@email.com', age: 26 };
        
        jest.spyOn(AuthService, 'updateProfile').mockResolvedValue(updatedUser);
        
        await AuthController.updateProfile(req, res, next);
        
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ age: 26, name: 'Elton S. Oliveira' }));
      });
    });

    describe('Delete', () => {
      it('Deve excluir um jogador do banco de dados (HTTP 204)', async () => {
        req.user = { id: 1 };
        jest.spyOn(AuthService, 'deleteUser').mockResolvedValue(true);
        
        await AuthController.delete(req, res, next);
        
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledTimes(1);
      });
    });
  });
});
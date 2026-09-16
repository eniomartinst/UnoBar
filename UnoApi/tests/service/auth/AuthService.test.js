import { jest } from '@jest/globals';
import AuthService from '../../../service/auth/AuthService.js';
import User from '../../../repository/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('Registro', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(User, 'create').mockResolvedValue({ id: 1, username: 'jogador1' });

      const result = await AuthService.register({ username: 'jogador1', password: '123' });
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('Login', () => {
    it('deve realizar login e retornar um token JWT válido', async () => {
      const mockUser = { id: 1, username: 'jogador1', password: 'hashedPassword' };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('token-jwt-falso');

      const result = await AuthService.login({ username: 'jogador1', password: '123' });
      expect(result).toBe('token-jwt-falso');
    });

    it('deve lançar erro de credenciais inválidas (senha errada)', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ id: 1, password: 'hashedPassword' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(AuthService.login({ username: 'user', password: '123' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('Gestão de Perfil', () => {
    it('deve retornar o perfil do usuário logado', async () => {
      const mockUser = { id: 1, username: 'jogador1' };
      jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser);

      const result = await AuthService.getProfile(1);
      expect(result).toEqual(mockUser);
    });

    it('deve atualizar o perfil do usuário corretamente', async () => {
      const mockUser = { 
        id: 1, username: 'velho', 
        save: jest.fn().mockResolvedValue(true) 
      };
      jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser);

      const result = await AuthService.updateProfile(1, { username: 'novo' });
      
      expect(result.username).toBe('novo');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('deve deletar o usuário do banco de dados', async () => {
      const mockUser = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser);

      const result = await AuthService.deleteUser(1);
      expect(result).toBe(true);
      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });
});
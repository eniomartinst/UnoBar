import AuthService from '../service/auth/AuthService.js';
import { registerSchema, loginSchema, tokenSchema, updateProfileSchema } from '../dtos/request/AuthRequestDTO.js';
import {
  formatRegisterResponse,
  formatLoginResponse,
  formatLogoutResponse,
  formatProfileResponse
} from '../dtos/response/AuthResponseDTO.js';

// AuthController — Controla o fluxo das requisições de autenticação e perfil
// Delega a lógica de negócio ao AuthService e formata a resposta com DTOs.

class AuthController {
  // Registro de Usuário
  async register(req, res, next) {
    try {
      const validatedData = registerSchema.parse(req.body);

      await AuthService.register(validatedData);

      return res.status(201).json(formatRegisterResponse());
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  // Login de Usuário
  async login(req, res, next) {
    try {
      const validatedData = loginSchema.parse(req.body);

      const token = await AuthService.login(validatedData);

      return res.status(200).json(formatLoginResponse(token));
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }

  // Logout de Usuário
  async logout(req, res, next) {
    try {
      // Middleware já validou o token, req.user tem os dados
      await AuthService.logout(req.user.id);

      return res.status(200).json(formatLogoutResponse());
    } catch (error) {
      next(error);
    }
  }

  // Obter Perfil do Usuário
  async profile(req, res, next) {
    try {
      // Passamos o ID do usuário direto, extraído pelo middleware
      const user = await AuthService.getProfile(req.user.id);

      return res.status(200).json(formatProfileResponse(user));
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }

  // Atualizar Perfil do Usuário
  async updateProfile(req, res, next) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await AuthService.updateProfile(req.user.id, validatedData);
      
      return res.status(200).json(formatProfileResponse(user));
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(401).json({ error: error.message });
      }
      if (error.message === 'Email already in use') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  // Deletar Conta do Usuário
  async delete(req, res, next) {
    try {
      await AuthService.deleteUser(req.user.id);

      return res.status(204).send();
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }
}

export default new AuthController();

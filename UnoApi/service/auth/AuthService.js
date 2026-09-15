import User from '../../repository/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// AuthService — Centraliza as regras de negócio de usuários e autenticação

class AuthService {
  // Registrar Usuário
  async register(data) {
    const { username, name, email, password, age } = data;

    const existingUser = await User.findOne({ where: { email } });
    const existingUsername = await User.findOne({ where: { username } });

    if (existingUser || existingUsername) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      name,
      email,
      password: hashedPassword,
      age
    });

    return user;
  }

  // Login de Usuário
  async login(data) {
    const { username, password } = data;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      user: {
        id: user.id,
      username: user.username,
      name: user.name
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    return token;
  }

  // Logout de Usuário
  async logout(userId) {
    // Aqui, apenas confirmamos a intenção de logout conforme requisito
    return true;
  }

  // Obter Perfil do Usuário
  async getProfile(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Atualizar Perfil do Usuário
  async updateProfile(userId, data) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('Email already in use');
      }
      user.email = data.email;
    }

    if (data.username) {
      user.username = data.username;
    }

    if (data.name) {
      user.name = data.name;
    }

    if (data.age) {
      user.age = data.age;
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(data.password, salt);
    }

    await user.save();
    return user;
  }

  // Deletar Conta do Usuário
  async deleteUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await user.destroy();
    return true;
  }
}

export default new AuthService();

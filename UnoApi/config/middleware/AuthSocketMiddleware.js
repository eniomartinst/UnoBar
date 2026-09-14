import jwt from 'jsonwebtoken';

const authSocketMiddleware = (socket, next) => {
  // O token pode vir em headers ou auth payload. Geralmente no Socket.IO enviamos no auth.
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    const err = new Error('Authentication error: Token missing');
    return next(err);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    // Salva o usuário no socket para podermos usar nos handlers
    socket.user = decoded.user;
    next();
  } catch (error) {
    const err = new Error('Authentication error: Invalid token');
    return next(err);
  }
};

export default authSocketMiddleware;

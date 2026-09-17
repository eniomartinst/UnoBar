import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: false,
});

export const connectSocket = (token) => {
  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    socket.auth = { token: authToken };
  }
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export default socket;

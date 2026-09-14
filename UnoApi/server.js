import 'dotenv/config';
import App from './app.js';
import http from 'http';
import { setupSocket } from './socket/index.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  const appInstance = new App();
  
  // Inicializa o banco de dados, middlewares e rotas antes de abrir a porta
  await appInstance.init();

  const server = http.createServer(appInstance.express);
  const io = setupSocket(server);
  appInstance.express.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

import express from 'express';
import cors from 'cors';
import database from './config/database/database.js';
import routes from './routes/index.js';
import ErrorHandlerMiddleware from './config/middleware/ErrorHandlerMiddleware.js';
import TrackingMiddleware from './config/middleware/TrackingMiddleware.js';
import NotFoundException from './config/exceptions/NotFoundException.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/docs/swagger.json' with { type: 'json' };

// 1. IMPORT CORRIGIDO PARA A SUBPASTA NOVA
import CardService from './service/card/CardService.js';

// 2. IMPORTS EXTRAS PARA SERVIR O FRONTEND
import path from 'path';
import { fileURLToPath } from 'url';

// Hack para usar o __dirname no padrão ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class App {
  constructor() {
    this.express = express();
  }

  async init() {
    await this.connectDatabase();
    this.middlewares();
    this.routes();
    this.errorMiddlewares();
  }

  async connectDatabase() {
    await database.connect();

    // Register models
    await import('./repository/User.js');
    await import('./repository/Game.js');
    await import('./repository/Card.js');
    await import('./repository/Score.js');
    await import('./repository/Round.js');
    await import('./repository/Tracking.js');

    // Sync database schema
    await database.connection.sync({ alter: true });
    console.log('Tables synchronized.');

    // Popular o banco com as 108 cartas
    await CardService.seedCards();
  }

  middlewares() {
    try {
      this.express.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      }));
      this.express.use(express.json());
      this.express.use(TrackingMiddleware);
      console.log('Middlewares configured.');
    } catch (error) {
      console.error('Error configuring middlewares:', error);
    }
  }

  routes() {
    try {
      // Rotas da API
      this.express.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      this.express.use('/api', routes);

      // 3. INTEGRAÇÃO DO FRONTEND
      // Serve os arquivos estáticos (CSS, JS, Imagens) gerados pelo Vite
      this.express.use(express.static(path.join(__dirname, '../UnoFront/dist')));

      // Qualquer requisição que não seja para "/api", envia o index.html do Frontend
      this.express.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../UnoFront/dist/index.html'));
      });

      console.log('Routes and Frontend serving configured.');
    } catch (error) {
      console.error('Error configuring routes:', error);
    }
  }

  errorMiddlewares() {
    // 404 Catch-all focado apenas nas rotas /api
    this.express.use('/api', (req, res, next) => {
      throw new NotFoundException(`Route ${req.originalUrl} not found`);
    });

    // Global error handler
    this.express.use(ErrorHandlerMiddleware);
    console.log('Error Handler Middleware configured.');
  }
}

export default App;
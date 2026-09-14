import express from 'express';
import cors from 'cors';
import database from './config/database/database.js';
import routes from './routes/index.js';
import ErrorHandlerMiddleware from './config/middleware/ErrorHandlerMiddleware.js';
import TrackingMiddleware from './config/middleware/TrackingMiddleware.js';
import NotFoundException from './config/exceptions/NotFoundException.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/docs/swagger.json' with { type: 'json' };
import CardService from './service/CardService.js';

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
      this.express.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      this.express.use('/api', routes);
      console.log('Routes configured.');
    } catch (error) {
      console.error('Error configuring routes:', error);
    }
  }

  errorMiddlewares() {
    // 404 Catch-all
    this.express.use((req, res, next) => {
      throw new NotFoundException(`Route ${req.originalUrl} not found`);
    });

    // Global error handler
    this.express.use(ErrorHandlerMiddleware);
    console.log('Error Handler Middleware configured.');
  }
}

export default App;

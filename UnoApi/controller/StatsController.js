import StatsService from '../service/infrastructure/StatsService.js';

// StatsController — Controla a extração e cálculo de métricas de uso da API

class StatsController {
  
  // Uso da API (Total, por método, por rota)
  async getUsage(req, res, next) {
    try {
      const usage = await StatsService.getUsage();
      return res.status(200).json(usage);
    } catch (error) {
      next(error);
    }
  }

  // Performance (Tempo médio, mínimo e máximo)
  async getPerformance(req, res, next) {
    try {
      const performance = await StatsService.getPerformance();
      return res.status(200).json(performance);
    } catch (error) {
      next(error);
    }
  }

  // Status Codes (Contagem de 200, 400, 500, etc)
  async getStatusCodes(req, res, next) {
    try {
      const statusSummary = await StatsService.getStatusCodes();
      return res.status(200).json(statusSummary);
    } catch (error) {
      next(error);
    }
  }

  // Endpoints Mais Acessados (Top rotas)
  async getPopularEndpoints(req, res, next) {
    try {
      const popular = await StatsService.getPopularEndpoints();
      return res.status(200).json(popular);
    } catch (error) {
      next(error);
    }
  }
}

export default new StatsController();

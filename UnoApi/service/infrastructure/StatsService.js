import Tracking from '../../repository/Tracking.js';

// StatsService — Centraliza as regras de negócio de estatísticas e métricas de uso

class StatsService {
  
  // Uso da API (Total, por método, por rota)
  async getUsage() {
    const trackings = await Tracking.findAll({ raw: true });
    
    return trackings.reduce((acc, log) => {
      // Incrementa total
      acc.totalRequests = (acc.totalRequests || 0) + 1;
      
      // Agrupa por método HTTP
      if (!acc.byMethod[log.requestMethod]) acc.byMethod[log.requestMethod] = 0;
      acc.byMethod[log.requestMethod]++;
      
      // Agrupa por endpoint
      if (!acc.byEndpoint[log.endpointAccess]) acc.byEndpoint[log.endpointAccess] = 0;
      acc.byEndpoint[log.endpointAccess]++;
      
      return acc;
    }, { totalRequests: 0, byMethod: {}, byEndpoint: {} });
  }

  // Performance (Tempo médio, mínimo e máximo)
  async getPerformance() {
    const trackings = await Tracking.findAll({ raw: true });
    
    // Agrupa por rota
    const groupedByEndpoint = trackings.reduce((acc, log) => {
      if (!acc[log.endpointAccess]) {
        acc[log.endpointAccess] = [];
      }
      acc[log.endpointAccess].push(log.responseTime);
      return acc;
    }, {});

    // Mapeia cada grupo para calcular media, minimo e maximo
    return Object.entries(groupedByEndpoint).map(([endpoint, times]) => {
      const total = times.reduce((sum, time) => sum + time, 0);
      const min = Math.min(...times);
      const max = Math.max(...times);
      const avg = total / times.length;
      
      return {
        endpoint,
        minTime: min,
        maxTime: max,
        avgTime: Number(avg.toFixed(2))
      };
    });
  }

  // Status Codes (Contagem de 200, 400, 500, etc)
  async getStatusCodes() {
    const trackings = await Tracking.findAll({ raw: true });
    
    return trackings.reduce((acc, log) => {
      const status = log.statusCode.toString();
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});
  }

  // Endpoints Mais Acessados (Top rotas)
  async getPopularEndpoints() {
    const trackings = await Tracking.findAll({ raw: true });
    
    // Conta acessos por rota
    const counts = trackings.reduce((acc, log) => {
      if (!acc[log.endpointAccess]) {
        acc[log.endpointAccess] = 0;
      }
      acc[log.endpointAccess]++;
      return acc;
    }, {});

    // Transforma em array e ordena usando sort
    return Object.entries(counts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export default new StatsService();

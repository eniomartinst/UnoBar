import Tracking from '../../repository/Tracking.js';

const TrackingMiddleware = (req, res, next) => {
  // Captura o tempo inicial
  const start = Date.now();

  // Escuta o evento 'finish' da resposta
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - start;
      const endpointAccess = req.originalUrl || req.url;
      const requestMethod = req.method;
      const statusCode = res.statusCode;
      // Pega o ID do usuário se estiver logado (depende de como a autenticação está configurada)
      const userId = req.user ? req.user.id : null;

      // Salva no banco de dados de forma assíncrona (não bloqueia a resposta)
      await Tracking.create({
        responseTime,
        endpointAccess,
        requestMethod,
        statusCode,
        userId
      });
      
    } catch (error) {
      console.error('Erro ao salvar tracking:', error);
    }
  });

  next();
};

export default TrackingMiddleware;

/**
 * Memoization Middleware para caching de requisições HTTP (ex: rotas de Scores).
 * 
 * @param {Object} options - Configuração do middleware de memoização.
 * @param {number} [options.max=100] - Número máximo de itens armazenados em cache.
 * @param {number} [options.maxAge=60000] - Tempo de vida útil do cache em milissegundos.
 * @returns {Function} Middleware Express.
 */
const MemoizationMiddleware = ({ max = 100, maxAge = 60000 } = {}) => {
  const cache = {};

  return (req, res, next) => {
    // Chave do cache baseada no método HTTP, URL e req.body
    const key = `${req.method}:${req.originalUrl || req.url}:${JSON.stringify(req.body || {})}`;
    const now = Date.now();

    // Filtro de Expiração: limpa itens expirados com base no maxAge
    Object.keys(cache)
      .filter((k) => now > cache[k].expiresAt)
      .forEach((k) => delete cache[k]);

    // Se já estiver em cache, reseta expiresAt e lastAccessed e retorna a resposta salva
    if (cache[key]) {
      cache[key].lastAccessed = Date.now();
      cache[key].expiresAt = Date.now() + maxAge;
      return res.json(cache[key].data);
    }

    // Intercepta res.json para salvar a resposta no cache antes do envio ao cliente
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const currentTime = Date.now();

      // Filtro de Expiração antes de adicionar nova entrada
      Object.keys(cache)
        .filter((k) => currentTime > cache[k].expiresAt)
        .forEach((k) => delete cache[k]);

      // Acumulador LRU: quando atinge o limite max, encontra o item com menor lastAccessed e remove-o
      const keys = Object.keys(cache);
      if (!cache[key] && keys.length >= max && keys.length > 0) {
        const lruKey = keys.reduce((oldestKey, currentKey) => {
          return cache[currentKey].lastAccessed < cache[oldestKey].lastAccessed
            ? currentKey
            : oldestKey;
        }, keys[0]);
        delete cache[lruKey];
      }

      // Armazena a resposta no cache
      cache[key] = {
        data: body,
        lastAccessed: currentTime,
        expiresAt: currentTime + maxAge,
      };

      return originalJson(body);
    };

    next();
  };
};

export default MemoizationMiddleware;

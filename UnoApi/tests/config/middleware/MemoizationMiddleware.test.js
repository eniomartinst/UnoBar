import { jest } from '@jest/globals';
import memoize from '../../../config/middleware/MemoizationMiddleware.js';

describe('MemoizationMiddleware - Testes Unitários de Cache e LRU', () => {
  let req, res, next;

  beforeEach(() => {
    req = { method: 'GET', originalUrl: '/api/test', body: {} };
    res = {
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Cenário 1: Armazenamento em Cache (Hit / Miss)', () => {
    it('Deve chamar next() no primeiro request (Cache Miss) e retornar do cache no segundo (Cache Hit)', () => {
      const middleware = memoize({ maxAge: 10000, max: 10 });

      // Primeiro Request (Miss)
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);

      // Simula o controller retornando os dados (interceptado pelo middleware)
      const fakeData = { data: 'teste' };
      res.json(fakeData); 

      // Segundo Request (Hit)
      const next2 = jest.fn();
      middleware(req, res, next2);

      expect(next2).not.toHaveBeenCalled();
    });

    it('Deve tratar requisições com bodies ou métodos diferentes como chaves distintas (Cache Miss)', () => {
      const middleware = memoize({ maxAge: 10000, max: 10 });

      middleware(req, res, next); 
      res.json({ data: 'teste1' });

      // Request diferente (POST)
      const req2 = { method: 'POST', originalUrl: '/api/test', body: { param: 1 } };
      const next2 = jest.fn();
      
      middleware(req2, res, next2); 
      expect(next2).toHaveBeenCalledTimes(1); // Tem que ser miss
    });
  });

  describe('Cenário 2: Filtro de Expiração (maxAge)', () => {
    it('Deve invalidar e limpar o cache quando o tempo maxAge expirar', () => {
      const middleware = memoize({ maxAge: 5000, max: 10 });

      middleware(req, res, next);
      res.json({ data: 'temporario' });

      // Avança o tempo virtual além do maxAge
      jest.advanceTimersByTime(6000);

      const next2 = jest.fn();
      middleware(req, res, next2);

      // Como expirou, tem que dar Miss e chamar o next
      expect(next2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cenário 3: Acumulador LRU (Capacidade Máxima e Evicção por lastAccessed)', () => {
    it('Deve ejetar o item menos recentemente acessado quando atingir o limite max', () => {
      const middleware = memoize({ maxAge: 10000, max: 2 }); // Limite estrito de 2!

      // Request 1
      const req1 = { method: 'GET', originalUrl: '/api/1', body: {} };
      middleware(req1, res, jest.fn());
      res.json({ id: 1 });

      // Request 2
      const req2 = { method: 'GET', originalUrl: '/api/2', body: {} };
      middleware(req2, res, jest.fn());
      res.json({ id: 2 });

      // Acessa Request 1 de novo (agora o req1 é o "mais recente", e o req2 ficou "velho")
      middleware(req1, res, jest.fn());

      // Request 3 (Vai estourar o limite. O req2 deve ser ejetado)
      const req3 = { method: 'GET', originalUrl: '/api/3', body: {} };
      middleware(req3, res, jest.fn());
      res.json({ id: 3 });

      // Tenta acessar o req2 de novo
      const next2 = jest.fn();
      middleware(req2, res, next2);
      
      // Tem que dar Miss (chamar o next), pois o req2 foi apagado da memória!
      expect(next2).toHaveBeenCalledTimes(1); 
    });
  });
});
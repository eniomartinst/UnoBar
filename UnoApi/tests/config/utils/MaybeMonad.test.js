import Maybe from '../../../config/utils/Maybe.js';

describe('Programação Funcional - Maybe Monad (Atividade 2)', () => {
  
  describe('Cenário 1: Operações Seguras com Dados Existentes', () => {
    it('Deve encadear transformações de dados corretamente (Functor)', () => {
      const result = Maybe.of(5)
        .map(x => x * 2)
        .map(x => x + 10)
        .getOrElse(0);
      
      expect(result).toBe(20);
    });
  });

  describe('Cenário 2: Tratamento Seguro de Falhas (Null Safety)', () => {
    it('Deve evitar erros (Null Pointer) ao tentar transformar um valor inexistente', () => {
      const result = Maybe.of(null)
        .map(x => x.propriedadeQueNaoExiste)
        .getOrElse('valor padrao');
      
      expect(result).toBe('valor padrao');
    });

    it('Deve aplicar múltiplas transformações seguras', () => {
      const result = Maybe.of(undefined)
        .map(x => x * 2)
        .map(x => x + 10)
        .getOrElse(0);
      
      expect(result).toBe(0);
    });
  });
});
/**
 * Monad Maybe: Utilizado para gerenciar operações com valores nulos ou indefinidos de forma segura.
 * Ele encapsula o valor e só executa a transformação (map) se o valor existir.
 */
class Maybe {
  constructor(value) {
    this.$value = value;
  }

  // Unit / Return: Coloca o valor dentro do contexto do Monad
  static of(value) {
    return new Maybe(value);
  }

  // Verifica se o valor é nulo/indefinido (Nothing)
  get isNothing() {
    return this.$value === null || this.$value === undefined;
  }

  // Functor (map): Aplica uma função ao valor se ele existir
  map(fn) {
    return this.isNothing ? Maybe.of(null) : Maybe.of(fn(this.$value));
  }

  // Extrai o valor do Monad ou retorna um valor padrão seguro
  getOrElse(defaultValue) {
    return this.isNothing ? defaultValue : this.$value;
  }
}

export default Maybe;
/**
 * Utilitários de Programação Funcional
 *
 * pipe  : executa funções da esquerda para a direita (f -> g -> h)
 * compose: executa funções da direita para a esquerda (h -> g -> f)
 * curry : transforma f(a, b) em f(a)(b)
 */

// pipe :: (...fns) -> (x) -> x
export const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

// compose :: (...fns) -> (x) -> x
export const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

// curry :: (f) -> CurriedF
export const curry = (fn) => {
  const arity = fn.length;
  const curried = (...args) =>
    args.length >= arity
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  return curried;
};

// prop :: key -> obj -> obj[key]
export const prop = (key) => (obj) => obj[key];

// when :: (predicate, transform) -> value -> value
export const when = (predicate, transform) => (value) =>
  predicate(value) ? transform(value) : value;

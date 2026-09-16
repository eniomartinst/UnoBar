import { applyStrategy } from '../../../service/mechanics/CardEffectStrategy.js';

describe('CardEffectStrategy', () => {
  const baseState = { direction: 1, pendingDraws: 0, activeColor: 'Red' };

  it('deve inverter a direção ao jogar Reverse', () => {
    const card = { value: 'Reverse' };
    const result = applyStrategy(card, baseState);
    expect(result.direction).toBe(-1);
    expect(result.pendingDraws).toBe(0);
  });

  it('deve somar 2 no pendingDraws ao jogar Draw2', () => {
    const card = { value: 'Draw2' };
    const result = applyStrategy(card, baseState);
    expect(result.direction).toBe(1);
    expect(result.pendingDraws).toBe(2);
  });

  it('deve somar 4 e mudar a cor ao jogar WildDraw4', () => {
    const card = { value: 'WildDraw4' };
    const result = applyStrategy(card, baseState, 'Blue');
    expect(result.pendingDraws).toBe(4);
    expect(result.activeColor).toBe('Blue');
  });

  it('deve apenas atualizar a cor ao jogar Wild', () => {
    const card = { value: 'Wild' };
    const result = applyStrategy(card, baseState, 'Green');
    expect(result.activeColor).toBe('Green');
    expect(result.pendingDraws).toBe(0);
  });

  it('deve manter o estado para cartas numéricas (Default)', () => {
    const card = { value: '5' };
    const result = applyStrategy(card, baseState);
    expect(result).toEqual(baseState);
  });
});
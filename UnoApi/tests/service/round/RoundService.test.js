import RoundService from '../../../service/round/RoundService.js';

describe('RoundService (Funções Puras)', () => {
  describe('isValidPlay', () => {
    const topCard = { color: 'Red', value: '5' };

    it('deve permitir jogar se for da mesma cor', () => {
      const card = { color: 'Red', value: '9' };
      expect(RoundService.isValidPlay(card, topCard, 'Red')).toBe(true);
    });

    it('deve permitir jogar se for do mesmo número', () => {
      const card = { color: 'Blue', value: '5' };
      expect(RoundService.isValidPlay(card, topCard, 'Red')).toBe(true);
    });

    it('deve permitir cartas Curinga sempre', () => {
      const card = { color: 'Wild', value: 'WildDraw4' };
      expect(RoundService.isValidPlay(card, topCard, 'Red')).toBe(true);
    });

    it('deve bloquear carta de cor e número diferentes', () => {
      const card = { color: 'Green', value: '2' };
      expect(RoundService.isValidPlay(card, topCard, 'Red')).toBe(false);
    });
  });

  describe('advanceTurn', () => {
    it('deve avançar 1 jogador normalmente', () => {
      // currentPlayerIndex: 0, direction: 1, playerCount: 4, card: '5'
      expect(RoundService.advanceTurn(0, 1, 4, '5')).toBe(1);
    });

    it('deve avançar 2 jogadores ao usar Skip', () => {
      expect(RoundService.advanceTurn(0, 1, 4, 'Skip')).toBe(2);
    });

    it('deve voltar o índice corretamente se a direção for -1', () => {
      // Jogador 0, direção -1 (anti-horário), vai pro jogador 3 (último)
      expect(RoundService.advanceTurn(0, -1, 4, '5')).toBe(3);
    });
  });

  describe('calculateRoundPoints', () => {
    it('deve somar os pontos de todos os perdedores', () => {
      const hands = {
        'jogador1': [], // Vencedor
        'jogador2': [{ points: 20 }, { points: 5 }], // 25 pts
        'jogador3': [{ points: 50 }] // 50 pts
      };
      const result = RoundService.calculateRoundPoints(hands, 'jogador1');
      expect(result).toBe(75);
    });
  });
});
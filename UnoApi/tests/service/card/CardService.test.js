import { jest } from '@jest/globals';
import CardService from '../../../service/card/CardService.js';
import Card from '../../../repository/Card.js';

describe('CardService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('deve popular o banco com 108 cartas caso esteja vazio', async () => {
    jest.spyOn(Card, 'count').mockResolvedValue(0);
    jest.spyOn(Card, 'bulkCreate').mockResolvedValue([]);

    await CardService.seedCards();

    expect(Card.count).toHaveBeenCalledTimes(1);
    expect(Card.bulkCreate).toHaveBeenCalledTimes(1);
  });

  it('não deve popular o banco se já existirem cartas', async () => {
    jest.spyOn(Card, 'count').mockResolvedValue(108);
    const bulkSpy = jest.spyOn(Card, 'bulkCreate');

    await CardService.seedCards();

    expect(Card.count).toHaveBeenCalledTimes(1);
    expect(bulkSpy).not.toHaveBeenCalled(); 
  });
});
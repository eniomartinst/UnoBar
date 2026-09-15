import RoundService from '../round/RoundService.js';

class PenaltyService {
  /**
   * Força um jogador a comprar X cartas e avança a vez.
   * Usado para estouro de tempo ou penalidade de UNO.
   */
  applyPenalty = async (round, username, players, penaltyCount = 1) => {
    const { drawn, deck, discardPile } = RoundService.drawCards(
      round.deck || [],
      round.discardPile || [],
      penaltyCount
    );

    const hands = {
      ...round.hands,
      [username]: [...((round.hands || {})[username] || []), ...drawn],
    };

    let saidUno = { ...(round.saidUno || {}) };
    if (hands[username].length > 1) {
      saidUno[username] = false;
    }

    // Passa a vez automaticamente
    const nextIndex = RoundService.advanceTurn(
      round.currentPlayerIndex,
      round.direction,
      players.length,
      null // null pois não há carta jogada
    );

    await round.update({ deck, discardPile, hands, saidUno, currentPlayerIndex: nextIndex });

    return { updatedRound: round, nextIndex };
  }
}

export default new PenaltyService();
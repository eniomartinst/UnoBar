import Card from '../../repository/Card.js';
import Round from '../../repository/Round.js';
import { applyStrategy } from '../mechanics/CardEffectStrategy.js'; // <-- Importando o Pattern Strategy

// Funções puras auxiliares
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const isStartCard = (card) => {
  const numeric = ['0','1','2','3','4','5','6','7','8','9'];
  return numeric.includes(card.value) && card.color !== 'Wild';
};

const RoundService = {
  // ─── Fluxo 1: Inicialização ──────────────────────────────────────────────
  initRound: async (gameId, players) => {
    const allCards = await Card.findAll({ raw: true });
    let deck = shuffle(allCards);

    const hands = {};
    for (const player of players) {
      hands[player.username] = deck.splice(0, 7);
    }

    let topCardIndex = deck.findIndex(isStartCard);
    if (topCardIndex === -1) topCardIndex = 0;
    const [topCard] = deck.splice(topCardIndex, 1);

    return await Round.create({
      gameId,
      status: 'active',
      currentPlayerIndex: 0,
      direction: 1,
      activeColor: topCard.color,
      pendingDraws: 0,
      deck,
      discardPile: [topCard],
      hands,
    });
  },

  // ─── Fluxo 2: Validação e Mecânicas ──────────────────────────────────────
  isValidPlay: (card, topCard, activeColor) => {
    if (!card) return false;
    if (!topCard) return true;
    
    if (card.color === 'Wild' || card.value === 'Wild' || card.value === 'WildDraw4') return true;
    
    const effectiveColor = activeColor || topCard.color;
    if (effectiveColor && card.color.toLowerCase() === effectiveColor.toLowerCase()) return true;
    if (String(card.value).toLowerCase() === String(topCard.value).toLowerCase()) return true;
    
    return false;
  },

  // -------------------------------------------------------------------------
  // DELEGAÇÃO: O RoundService não sabe mais o que as cartas fazem.
  // Ele simplesmente passa a bola para o Strategy processar!
  // -------------------------------------------------------------------------
  applyCardEffect: (card, state, chosenColor) => {
    return applyStrategy(card, state, chosenColor);
  },

  advanceTurn: (currentIndex, direction, playerCount, cardValue) => {
    const n = playerCount;
    const isSkip = cardValue === 'Skip' || cardValue === 'Draw2' || cardValue === 'WildDraw4' || (cardValue === 'Reverse' && n === 2);
    const steps = isSkip ? 2 : 1;
    return ((currentIndex + direction * steps) % n + n) % n;
  },

  drawCards: (deck, discardPile, count) => {
    let newDeck = [...deck];
    let newDiscard = [...discardPile];
    const drawn = [];

    for (let i = 0; i < count; i++) {
      if (newDeck.length === 0) {
        if (newDiscard.length <= 1) break;  
        const topCard = newDiscard.pop();  
        newDeck = shuffle(newDiscard);     
        newDiscard = [topCard];          
      }
      drawn.push(newDeck.shift());
    }

    return { drawn, deck: newDeck, discardPile: newDiscard };
  },

  // ─── Fluxo 3: Fim de Rodada e Helpers ────────────────────────────────────
  checkRoundWinner: (hands) => {
    for (const [username, hand] of Object.entries(hands)) {
      if (Array.isArray(hand) && hand.length === 0) return username;
    }
    return null;
  },

  calculateRoundPoints: (hands, winnerUsername) =>
    Object.entries(hands)
      .filter(([username]) => username !== winnerUsername)
      .flatMap(([, hand]) => hand)
      .reduce((sum, card) => sum + (card.points || 0), 0),

  getActiveRound: async (gameId) =>
    Round.findOne({
      where: { gameId, status: 'active' },
      order: [['createdAt', 'DESC']],
    }),

  publicRoundState: (roundData, players) => {
    const hands = roundData.hands || {};
    const handCounts = Object.fromEntries(
      Object.entries(hands).map(([u, h]) => [u, Array.isArray(h) ? h.length : h])
    );
    const discardPile = roundData.discardPile || [];

    return {
      roundId: roundData.id,
      gameId: roundData.gameId,
      status: roundData.status,
      topCard: discardPile.at(-1) || null,
      activeColor: roundData.activeColor,
      currentPlayerIndex: roundData.currentPlayerIndex,
      currentPlayer: players[roundData.currentPlayerIndex]?.username || null,
      direction: roundData.direction,
      pendingDraws: roundData.pendingDraws,
      deckSize: (roundData.deck || []).length,
      handCounts,
      saidUno: roundData.saidUno || {},
    };
  },

  privateHandState: (roundData, username) =>
    (roundData.hands || {})[username] || [],
};

export default RoundService;
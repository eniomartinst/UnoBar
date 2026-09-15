export const formatCardResponse = (card) => {
  return {
    id: card.id,
    color: card.color,
    value: card.value,
    gameId: card.gameId,
    createdAt: card.createdAt
  };
};

export const formatManyCardsResponse = (cards) => {
  return cards.map(formatCardResponse);
};

const strategies = {
  Reverse: (state, chosenColor) => ({
    direction: state.direction * -1,
    pendingDraws: state.pendingDraws,
    activeColor: chosenColor || state.activeColor
  }),
  
  Draw2: (state, chosenColor) => ({
    direction: state.direction,
    pendingDraws: state.pendingDraws + 2,
    activeColor: chosenColor || state.activeColor
  }),
  
  WildDraw4: (state, chosenColor) => ({
    direction: state.direction,
    pendingDraws: state.pendingDraws + 4,
    activeColor: chosenColor || 'Red'
  }),
  
  Wild: (state, chosenColor) => ({
    direction: state.direction,
    pendingDraws: state.pendingDraws,
    activeColor: chosenColor || 'Red'
  }),
  
  // Comportamento Padrão (Cartas Numéricas e Skip)
  Default: (state, chosenColor) => ({
    direction: state.direction,
    pendingDraws: state.pendingDraws,
    activeColor: chosenColor || state.activeColor
  })
};

export const applyStrategy = (card, state, chosenColor) => {
  const strategy = strategies[card.value] || strategies.Default;
  return strategy(state, chosenColor);
};
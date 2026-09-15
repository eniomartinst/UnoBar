export const formatGameResponse = (game) => {
  const sanitizedUsers = (game.usersInGame || []).map(u => {
    if (typeof u === 'object' && u !== null) {
      const { token, ...rest } = u;
      return rest;
    }
    return u;
  });

  return {
    id: game.id,
    title: game.title,
    status: game.status,
    maxPlayers: game.maxPlayers,
    usersInGame: sanitizedUsers,
    createdAt: game.createdAt
  };
};

export const formatManyGamesResponse = (games) => {
  return games.map(formatGameResponse);
};

// Etapa 9 — confirmação de encerramento
export const formatEndGameResponse = () => ({
  message: "Game ended successfully"
});

// Etapa 10 — estado atual do jogo
export const formatGameStateResponse = (game) => ({
  game_id: game.id,
  state: game.status
});

// Etapa 11 — lista de jogadores
// Usa map para extrair somente o username de cada entrada em usersInGame (HOF)
export const formatPlayersResponse = (game) => ({
  game_id: game.id,
  players: (game.usersInGame || []).map((u) => u.username)
});

// Etapa 12 — jogador atual (baseado no índice currentPlayerIndex)
export const formatCurrentPlayerResponse = (game) => ({
  game_id: game.id,
  current_player: ((game.usersInGame || [])[game.currentPlayerIndex ?? 0] || {}).username ?? null
});

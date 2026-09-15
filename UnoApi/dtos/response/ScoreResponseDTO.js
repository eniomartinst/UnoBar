export const formatScoreResponse = (score) => {
  return {
    id: score.id,
    playerId: score.playerId,
    gameId: score.gameId,
    score: score.score,
    createdAt: score.createdAt
  };
};

export const formatManyScoresResponse = (scores) => {
  return scores.map(formatScoreResponse);
};

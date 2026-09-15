import { z } from 'zod';
export const createScoreSchema = z.object({
  playerId: z.coerce.number().int().positive(),
  gameId: z.coerce.number().int().positive(),
  score: z.coerce.number().int()
});

export const updateScoreSchema = createScoreSchema.partial();
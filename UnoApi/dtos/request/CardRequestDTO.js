import { z } from 'zod';
export const createCardSchema = z.object({
  color: z.string(),
  value: z.string(),
  gameId: z.coerce.number().int().positive()
});

export const updateCardSchema = createCardSchema.partial();
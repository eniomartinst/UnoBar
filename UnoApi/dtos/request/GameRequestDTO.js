import { z } from 'zod';
export const createGameSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  status: z.string().optional(),
  maxPlayers: z.number().int().min(2).max(10)
});

export const updateGameSchema = createGameSchema.partial();

// Valida o JSON de entrada para as ações de Join, Start e Leave (Reqs 6, 7 e 8)
export const gameActionSchema = z.object({
  game_id: z.coerce.number().int().positive(),
  access_token: z.string().min(1, "Access token is required")
});

// Valida o JSON de entrada para Finalizar o jogo (Req 9)
export const gameEndSchema = z.object({
  game_id: z.coerce.number().int().positive(),
  access_token: z.string().min(1, "Access token is required")
});

// Valida o JSON de entrada para consultas de estado do jogo (Reqs 10, 11 e 12)
export const gameStateQuerySchema = z.object({
  game_id: z.coerce.number().int().positive()
});
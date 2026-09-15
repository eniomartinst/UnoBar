import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  age: z.coerce.number().int().min(1, 'Age must be a positive integer'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const tokenSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
});

export const updateProfileSchema = z.object({
  username: z.string().min(1, 'Username must not be empty').optional(),
  name: z.string().min(1, 'Name must not be empty').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  age: z.coerce.number().int().min(1, 'Age must be a positive integer').optional(),
});

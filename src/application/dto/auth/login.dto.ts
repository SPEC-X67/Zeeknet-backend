import { z } from 'zod';

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginRequestDto = z.infer<typeof LoginDto>;
import { z } from 'zod';
import { UserRole } from '../../../domain/enums/user-role.enum';

export const RegisterDto = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional().default(UserRole.SEEKER),
});

export type RegisterRequestDto = z.infer<typeof RegisterDto>;
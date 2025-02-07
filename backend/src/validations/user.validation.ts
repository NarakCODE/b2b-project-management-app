import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email')
  .trim()
  .min(1)
  .max(255);

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: emailSchema,
  profilePicture: z.string().trim(),
});

import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .trim()
  .max(255);

export const descriptionSchema = z.string().trim().max(255).optional();

export const workspaceIdSchema = z
  .string()
  .trim()
  .min(1, { message: 'Workspace ID is required' });

export const changeRoleSchema = z.object({
  roleId: z.string().trim().min(1),
  memberId: z.string().trim().min(1),
});

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

import { TaskPriorityEnum, TaskStatusEnum } from '@/constant';
import { z } from 'zod';

// ********* SIGN IN *********
export const SignInRequestSchema = z.object({
  email: z.string().trim().email('Invalid email address').min(1, {
    message: 'Workspace name is required',
  }),
  password: z.string().trim().min(1, {
    message: 'Password is required',
  }),
});

export const SignInResponseSchema = z.object({
  message: z.string().trim(),
  user: z.object({
    _id: z.string().trim(),
    currentWorkspace: z.string().trim(),
  }),
});
export type SignInRequestSchemaType = z.infer<typeof SignInRequestSchema>;
export type SignInResponseSchemaType = z.infer<typeof SignInResponseSchema>;

// ********* REGISTER *********
export const RegisterRequestSchema = z.object({
  name: z.string().trim().min(1, {
    message: 'Workspace name is required',
  }),
  email: z.string().trim().email('Invalid email address').min(1, {
    message: 'Workspace name is required',
  }),
  password: z.string().trim().min(1, {
    message: 'Password is required',
  }),
});

export type RegisterRequestSchemaType = z.infer<typeof RegisterRequestSchema>;

// ********* WORKSPACE *********
export const WorkspaceTypeSchema = z.object({
  _id: z.string().trim(),
  name: z.string().trim(),
  description: z.string().trim().optional().nullable(),
  owner: z.string().trim(),
  inviteCode: z.string().trim(),
});
export const CreateWorkspaceRequestSchema = z.object({
  name: z.string().trim().min(1, {
    message: 'Workspace name is required',
  }),
  description: z.string().trim(),
});
export const CreateWorkspaceResponseSchema = z.object({
  message: z.string(),
  workspace: WorkspaceTypeSchema,
});
export const EditWorkspaceRequestSchema = z.object({
  name: z.string().trim().min(1, {
    message: 'Workspace name is required',
  }),
  description: z.string().trim(),
});

export type CreateWorkspaceRequestSchemaType = z.infer<
  typeof CreateWorkspaceRequestSchema
>;
export type CreateWorkspaceResponseSchemaType = z.infer<
  typeof CreateWorkspaceResponseSchema
>;

export type EditWorkspaceRequestSchemaType = z.infer<
  typeof EditWorkspaceRequestSchema
>;

// ********* PROJECT *********
export const ProjectTypeSchema = z.object({
  _id: z.string().trim(),
  name: z.string().trim(),
  emoji: z.string().trim(),
  description: z.string().trim().optional().nullable(),
  workspace: z.string().trim(),
  createdBy: z.object({
    _id: z.string().trim(),
    name: z.string().trim(),
    profilePicture: z.string().trim().optional().nullable(),
  }),
  createdAt: z.string().trim(),
  updatedAt: z.string().trim(),
});

export const CreateProjectRequestSchema = z.object({
  name: z.string().trim().min(1, {
    message: 'Project title is required',
  }),
  description: z.string().trim(),
});

export const EditProjectRequestSchema = z.object({
  name: z.string().trim().min(1, {
    message: 'Project title is required',
  }),
  description: z.string().trim(),
});

// Type
export type CreateProjectRequestSchemaType = z.infer<
  typeof CreateProjectRequestSchema
>;
export type CreateProjectResponseSchemaType = z.infer<typeof ProjectTypeSchema>;
export type EditProjectRequestSchemaType = z.infer<
  typeof EditProjectRequestSchema
>;

// ********* TASK *********
export const TaskTypeRequestSchema = z.object({
  title: z.string().trim().min(1, {
    message: 'Title is required',
  }),
  description: z.string().trim(),
  projectId: z.string().trim().min(1, {
    message: 'Project is required',
  }),
  status: z.enum(
    Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
    {
      required_error: 'Status is required',
    }
  ),
  priority: z.enum(
    Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
    {
      required_error: 'Priority is required',
    }
  ),
  assignedTo: z.string().trim().min(1, 'Assigned to is required.'),
  dueDate: z
    .date({
      required_error: 'A due date is required.',
    })
    .optional(),
});

export const EditTaskRequestSchema = z.object({
  title: z.string().trim().min(1, {
    message: 'Title is required',
  }),
  description: z.string().trim(),

  status: z.enum(
    Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
    {
      required_error: 'Status is required',
    }
  ),
  priority: z.enum(
    Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
    {
      required_error: 'Priority is required',
    }
  ),
  assignedTo: z.string().trim().min(1, 'Assigned to is required.'),
  dueDate: z
    .date({
      required_error: 'A due date is required.',
    })

    .nullable() // Allow null values
    .optional(), // Make the field optional
});

// Type
export type TaskTypeRequestSchemaType = z.infer<typeof TaskTypeRequestSchema>;
export type EditTaskRequestSchemaType = z.infer<typeof EditTaskRequestSchema>;

// User
export const UpdateUserRequestSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email('Invalid email address').min(1).max(255),
  profilePicture: z.string().trim().optional(),
});

// Type
export type UpdateUserRequestSchemaType = z.infer<
  typeof UpdateUserRequestSchema
>;

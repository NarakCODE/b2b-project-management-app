import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from '../validations/task.validation';
import { projectIdSchema } from '../validations/project.validation';
import { workspaceIdSchema } from '../validations/workspace.validation';
import { getMemberRoleInWorkspace } from '../services/member.service';
import { roleGuard } from '../utils/roleGuard';
import { Permissions } from '../enums/role.enum';
import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
} from '../services/task.service';
import { HTTPSTATUS } from '../config/http.config';

// Create new task
export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.CREATE_TASK]);

    const { task } = await createTaskService(
      userId,
      workspaceId,
      projectId,
      body
    );

    // return success response
    return res.status(HTTPSTATUS.OK).json({
      message: 'Task created successfully',
      task,
    });
  }
);

// Get all tasks in workspace
export const getAllTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status
        ? (req.query.status as string)?.split(',')
        : undefined,

      priority: req.query.priority
        ? (req.query.priority as string)?.split(',')
        : undefined,

      assignedTo: req.query.assignedTo
        ? (req.query.assignedTo as string)?.split(',')
        : undefined,

      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate as string | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.VIEW_ONLY]);

    const result = await getAllTasksService(workspaceId, pagination, filters);

    return res.status(HTTPSTATUS.OK).json({
      message: 'All tasks fetched successfully',
      ...result,
    });
  }
);

// Get single task
export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.VIEW_ONLY]);

    const task = await getTaskByIdService(workspaceId, taskId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Task fetched successfully',
      task,
    });
  }
);

// Update task by id
export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    // Get current user who authorized the request
    const userId = req.user?._id;
    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const body = updateTaskSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.EDIT_TASK]);

    const { task } = await updateTaskService(
      workspaceId,
      projectId,
      taskId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Task updated successfully',
      task,
    });
  }
);

// Delete task by id
export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.DELETE_TASK]);

    await deleteTaskService(workspaceId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Task deleted successfully',
    });
  }
);

import { Router } from 'express';
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  deleteTaskController,
  updateTaskController,
} from '../controllers/task.controller';

const taskRouter = Router();

// Create a task
taskRouter.post(
  '/project/:projectId/workspace/:workspaceId/create',
  createTaskController
);

// Get all tasks in workspace
taskRouter.get('/workspace/:workspaceId/all', getAllTasksController);

// Get single task by id
taskRouter.get(
  '/:id/project/:projectId/workspace/:workspaceId',
  getTaskByIdController
);

// Update task by id
taskRouter.put(
  '/:id/project/:projectId/workspace/:workspaceId/update',
  updateTaskController
);

// Delele task by id
taskRouter.delete('/:id/workspace/:workspaceId/delete', deleteTaskController);

export default taskRouter;

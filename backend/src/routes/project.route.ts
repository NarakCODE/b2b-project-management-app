import { Router } from 'express';
import {
  createProjectController,
  getAllProjectsInWorkspaceController,
  updateProjectController,
  getProjectByIdAndWorkspaceIdController,
  deleteProjectController,
  getProjectAnalyticsController,
} from '../controllers/project.controller';

const projectRoutes = Router();

// Create new project
projectRoutes.post('/workspace/:workspaceId/create', createProjectController);

// Get all projects in workspace
projectRoutes.get(
  '/workspace/:workspaceId/all',
  getAllProjectsInWorkspaceController
);

// Get project in workspace
projectRoutes.get(
  '/:id/workspace/:workspaceId',
  getProjectByIdAndWorkspaceIdController
);

// Update project in workspace
projectRoutes.put(
  '/:id/workspace/:workspaceId/update',
  updateProjectController
);

// Delete project in workspace
projectRoutes.delete(
  '/:id/workspace/:workspaceId/delete',
  deleteProjectController
);

// Project analytics
projectRoutes.get(
  '/:id/workspace/:workspaceId/analytics',
  getProjectAnalyticsController
);



export default projectRoutes;

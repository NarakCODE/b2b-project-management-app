import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from '../validations/project.validation';
import { workspaceIdSchema } from '../validations/workspace.validation';
import { getMemberRoleInWorkspace } from '../services/member.service';
import { roleGuard } from '../utils/roleGuard';
import { Permissions } from '../enums/role.enum';
import {
  createProjectService,
  deleteProjectService,
  getAllProjectsInWorkspaceService,
  getProjectByIdInWorkspaceService,
  updateProjectInWorkspaceService,
  getProjectAnalyticsService,
} from '../services/project.service';

// Create a new project
export const createProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    // Validate the request body
    const body = createProjectSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Check if the current user is the owner of the workspace
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [
      Permissions.CREATE_PROJECT,
    ]);

    // Create the project
    const { project } = await createProjectService(userId, workspaceId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: 'Project created successfully',
      project,
    });
  }
);

// Get all projects in workspace
export const getAllProjectsInWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    // Validate the workspaceId string from the request
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Check if the current user is the owner of the workspace
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.VIEW_ONLY]);

    // Page size and page number
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageNumber = parseInt(req.query.pageNumber as string) || 1;

    //  Get all projects in workspace

    const { projects, totalCount, totalPages, skip } =
      await getAllProjectsInWorkspaceService(workspaceId, pageSize, pageNumber);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Projects fetched successfully',
      projects,
      totalCount,
      totalPages,
      skip,
      limit: pageSize,
    });
  }
);

// Get project in workspace
export const getProjectByIdAndWorkspaceIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.VIEW_ONLY]);

    const { project } = await getProjectByIdInWorkspaceService(
      projectId,
      workspaceId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Project fetched successfully',
      project,
    });
  }
);

// Update project in workspace
export const updateProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const body = updateProjectSchema.parse(req.body);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.EDIT_PROJECT]);

    // Update the project
    const { populatedProject } = await updateProjectInWorkspaceService(
      projectId,
      workspaceId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Project updated successfully',
      populatedProject,
    });
  }
);

// Delete project in workspace
export const deleteProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [
      Permissions.DELETE_PROJECT,
    ]);

    await deleteProjectService(projectId, workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Project deleted successfully',
    });
  }
);

// Get project analytics
export const getProjectAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.VIEW_ONLY]);

    const { analytics } = await getProjectAnalyticsService(
      projectId,
      workspaceId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Project analytics retrieved successfully',
      analytics,
    });
  }
);

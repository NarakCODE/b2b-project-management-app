import { Request, Response } from 'express';
import { HTTPSTATUS } from '../config/http.config';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { getMemberRoleInWorkspace } from '../services/member.service';
import {
  changeMemberRoleService,
  createWorkspaceService,
  deleteWorkspaceService,
  getAllWorkspacesUserIsMemberService,
  getWorkspaceAnalyticsService,
  getWorkspaceByIdService,
  getWorkspaceMembersService,
  updateWorkspaceService,
} from '../services/workspace.service';
import {
  changeRoleSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema,
} from '../validations/workspace.validation';
import { Permissions } from '../enums/role.enum';
import { roleGuard } from '../utils/roleGuard';

// Create a new workspace
export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createWorkspaceSchema.parse(req.body);

    const userId = req.user?._id;
    const { workspace } = await createWorkspaceService(userId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: 'Workspace created successfully',
      workspace,
    });
  }
);

// Update workspace member role
export const changeWorkspaceMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [
      Permissions.CHANGE_MEMBER_ROLE,
    ]);

    const { member } = await changeMemberRoleService(
      workspaceId,
      memberId,
      roleId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Member role changed successfully',
      member,
    });
  }
);

// Get all workspaces for the current user where is member
export const getAllWorkspacesUserIsMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { workspaces } = await getAllWorkspacesUserIsMemberService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'User workspaces fetched successfully',
      result: workspaces.length,
      workspaces,
    });
  }
);

// Get workspace by id
export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    await getMemberRoleInWorkspace(userId, workspaceId);

    const { workspace } = await getWorkspaceByIdService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Workspace fetched successfully',
      workspace,
    });
  }
);

// Get workspace members
export const getWorkspaceMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.VIEW_ONLY]);

    const { members, roles } = await getWorkspaceMembersService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Workspace members re successfully',
      members,
      roles,
    });
  }
);

// Get workspace analytics
export const getWorkspaceAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [Permissions.VIEW_ONLY]);

    const { analytics } = await getWorkspaceAnalyticsService(workspaceId);
    return res.status(HTTPSTATUS.OK).json({
      message: 'Workspace analytics fetched successfully',
      analytics,
    });
  }
);

// Update workspace by id
export const updateWorkspaceById = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const body = updateWorkspaceSchema.parse(req.body);

    // Check if current user(userId) is the owner of the workspace(workspaceId) and then send the updated workspace( req.body)
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [
      Permissions.EDIT_WORKSPACE,
    ]);
    const { workspace } = await updateWorkspaceService(workspaceId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Workspace updated successfully',
      workspace,
    });
  }
);

// Delte workspace by id
export const deleteWorkspaceById = asyncHandler(
  async (req: Request, res: Response) => {
    // Check workspace id validation
    const workspaceId = workspaceIdSchema.parse(req.params.id);

    // Check the current user logged in
    const userId = req.user?._id;

    // Check role
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role as 'OWNER' | 'ADMIN' | 'MEMBER', [
      Permissions.DELETE_WORKSPACE,
    ]);

    // Delete the workspace
    const { currentWorkspace } = await deleteWorkspaceService(
      userId,
      workspaceId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Workspace deleted successfully',
      currentWorkspace,
    });
  }
);

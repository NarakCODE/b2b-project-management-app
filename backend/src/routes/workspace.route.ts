import { Router } from 'express';
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  deleteWorkspaceById,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMembersController,
  updateWorkspaceById,
} from '../controllers/workspace.controller';

const workspaceRoutes = Router();

workspaceRoutes.post('/create/new', createWorkspaceController);

workspaceRoutes.put("/update/:id", updateWorkspaceById)
workspaceRoutes.delete("/delete/:id", deleteWorkspaceById)
workspaceRoutes.put(
  '/change/member/role/:id',
  changeWorkspaceMemberRoleController
);

workspaceRoutes.get('/all', getAllWorkspacesUserIsMemberController);
workspaceRoutes.get('/:id', getWorkspaceByIdController);
workspaceRoutes.get('/members/:id', getWorkspaceMembersController);
workspaceRoutes.get('/analytics/:id', getWorkspaceAnalyticsController);

export default workspaceRoutes;

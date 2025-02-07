import { ErrorCodeEnum } from '../enums/error-code.enum';
import { Roles } from '../enums/role.enum';
import MemberModel from '../models/member.model';
import RoleModel from '../models/roles-permission.model';
import WorkspaceModel from '../models/workspace.model';
import { NotFoundException, UnauthorizedException } from '../utils/appError';

// Get member role in workspace service
export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException('Workspace not found.');
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId,
  }).populate('role');

  if (!member) {
    throw new UnauthorizedException(
      'You are not a member of this workspace',
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  const roleName = member.role?.name;

  return { role: roleName };
};

// Join workspace by invite code service
export const joinWorkspaceByInviteCodeService = async (
  userId: string,
  inviteCode: string
) => {
  const workspace = await WorkspaceModel.findOne({ inviteCode });
  if (!workspace) {
    throw new NotFoundException('Invalid invite code or workspace.');
  }

  // Check if user is already a member of the workspace
  // @return - true if user is already a member of the workspace
  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  }).exec();

  if (existingMember) {
    throw new UnauthorizedException(
      'You are already a member of this workspace'
    );
  }

  const role = await RoleModel.findOne({ name: Roles.MEMBER });

  if (!role) {
    throw new NotFoundException('Role not found');
  }

  // Add user to workspace as a member
  const newMember = new MemberModel({
    userId,
    workspaceId: workspace._id,
    role: role._id,
  });
  await newMember.save();

  return { workspaceId: workspace._id, role: role._id };
};

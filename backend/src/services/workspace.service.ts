import mongoose, { Model } from 'mongoose';
import { Roles } from '../enums/role.enum';
import MemberModel from '../models/member.model';
import RoleModel from '../models/roles-permission.model';
import UserModel from '../models/user.model';
import WorkspaceModel from '../models/workspace.model';
import { BadRequestException, NotFoundException } from '../utils/appError';
import TaskModel from '../models/task.model';
import { TaskStatusEnum } from '../enums/task.enum';
import ProjectModel from '../models/project.model';

// Create new workspace service
export const createWorkspaceService = async (
  userId: string,
  body: { name: string; description?: string }
) => {
  // Destructure name and description from body
  const { name, description } = body;

  // Find the user by userId
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Find the owner role
  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  if (!ownerRole) {
    throw new NotFoundException('Role not found');
  }

  // Create a new workspace
  const workspace = new WorkspaceModel({
    name,
    description,
    owner: user._id,
  });

  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });

  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return {
    workspace,
  };
};

// Get all workspaces service for the current user where is member
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate('workspaceId')
    .select('-password') // (-) password is not needed
    .exec();

  // Extract workspace details from memberships
  const workspaces = memberships.map(membership => membership.workspaceId);

  return { workspaces };
};

// Get workspace by id service
export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException('Workspace not found');
  }

  // Find member
  const members = await MemberModel.find({
    workspaceId,
  }).populate('role');

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return { workspace: workspaceWithMembers };
};

// Get workspace members service
export const getWorkspaceMembersService = async (workspaceId: string) => {
  // Fetch all members of the workspace
  const members = await MemberModel.find({ workspaceId })
    .populate('userId', 'name email profilePicture -password')
    .populate('role', 'name');

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select('-permission')
    .lean();

  return { members, roles };
};

// Get workspace analytics service
export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();

  const totalTasks = await TaskModel.countDocuments({ workspace: workspaceId });

  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });

  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics = {
    totalTasks,
    overdueTasks,
    completedTasks,
  };

  return { analytics };
};

// Change workspace member role service
export const changeMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException('Workspace not found');
  }

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException('Role not found');
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  });
  if (!member) {
    throw new NotFoundException('Member not found');
  }

  member.role = role;
  await member.save();

  return { member };
};

// Update workspace service
export const updateWorkspaceService = async (
  workspaceId: string,
  body: { name: string; description?: string }
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException('Workspace not found');
  }

  workspace.name = body.name || workspace.name;
  workspace.description = body.description || workspace.description;

  await workspace.save();

  return { workspace };
};

// Delete workspace service
export const deleteWorkspaceService = async (
  userId: string,
  workspaceId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await WorkspaceModel.findById(workspaceId).session(
      session
    );

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if the user owns the workspace
    if (workspace.owner.toString() !== userId.toString()) {
      throw new BadRequestException('You are not the owner of this workspace');
    }

    // Find the owner role and delete the workspace
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete the workspace
    await ProjectModel.deleteMany({ workspace: workspace._id }).session(
      session
    );

    // Delete the task
    await TaskModel.deleteMany({ workspaceId: workspace._id }).session(session);

    // Delete the member
    await MemberModel.deleteMany({ workspaceId: workspace._id }).session(
      session
    );

    // Update the user's current workspace if it matches the deleted workspace
    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({ userId }).session(
        session
      );

      // Update the user current workspace
      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;

      await user.save({ session });
    }
    await workspace.deleteOne({ session });

    await session.commitTransaction();

    session.endSession();

    return {
      currentWorkspace: user.currentWorkspace,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

import mongoose from 'mongoose';
import UserModel from '../models/user.model';
import AccountModel from '../models/account.model';
import RoleModel from '../models/roles-permission.model';
import { Roles } from '../enums/role.enum';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '../utils/appError';
import MemberModel from '../models/member.model';
import { ProviderEnum } from '../enums/account-provider.enum';
import WorkspaceModel from '../models/workspace.model';

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email: string; // Made email required in the type
}) => {
  const { providerId, provider, displayName, picture, email } = data;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log('Started session...');

    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      if (!email) {
        throw new Error('Email is required for user creation');
      }

      user = new UserModel({
        email: email,
        name: displayName,
        profilePicture: picture || null,
      });

      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });
      await account.save({ session });

      const workspace = new WorkspaceModel({
        name: 'My Workspace',
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

      if (!ownerRole) {
        throw new NotFoundException('Role not found');
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }

    await session.commitTransaction();
    console.log('Transaction committed successfully');
    return { user };
  } catch (error) {
    await session.abortTransaction();
    console.error('Transaction aborted:', error);
    throw error;
  } finally {
    session.endSession();
    console.log('Session ended');
  }
};
export const registerUserService = async (body: {
  email: string;
  name: string;
  password: string;
}) => {
  const { email, name, password } = body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = new UserModel({
      email,
      name,
      password,
    });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    // 3. Create a new workspace for the new user
    const workspace = new WorkspaceModel({
      name: `My Workspace`,
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    const ownerRole = await RoleModel.findOne({
      name: Roles.OWNER,
    }).session(session);

    if (!ownerRole) {
      throw new NotFoundException('Owner role not found');
    }

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save({ session });

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log('End Session...');

    return {
      userId: user._id,
      workspaceId: workspace._id,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });

  if (!account) {
    throw new NotFoundException('Account not found for the given email');
  }

  const user = await UserModel.findOne(account.userId);

  if (!user) {
    throw new NotFoundException('User not found for the given email');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException('Invalid email or password');
  }

  return user.omitPassword();
};

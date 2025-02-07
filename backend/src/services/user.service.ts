import UserModel from '../models/user.model';
import { BadRequestException } from '../utils/appError';

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate('currentWorkspace')
    .select('-password');

  if (!user) {
    throw new BadRequestException('User not found');
  }

  return { user };
};

export const getUserByIdService = async (id: string) => {
  const user = await UserModel.findOne({ _id: id })
    .populate('currentWorkspace')
    .select('-password');

  if (!user) {
    throw new BadRequestException('User not found');
  }
  return { user };
};

export const updateUserService = async (
  id: string,
  body: { name: string; email: string; profilePicture: string }
) => {
  const user = await UserModel.findByIdAndUpdate(id, body, { new: true });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  return { user };
};

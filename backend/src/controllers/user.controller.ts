import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';
import {
  getCurrentUserService,
  getUserByIdService,
  updateUserService,
} from '../services/user.service';
import { updateUserSchema } from '../validations/user.validation';

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    console.log(userId);

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'User fetched successfully',
      user,
    });
  }
);

export const getUserByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { user } = await getUserByIdService(id);

    return res.status(HTTPSTATUS.OK).json({
      message: 'User fetched successfully',
      user,
    });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const body = updateUserSchema.parse(req.body);

    const { user } = await updateUserService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: 'User updated successfully',
      user,
    });
  }
);

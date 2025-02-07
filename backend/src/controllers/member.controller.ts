import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { z } from 'zod';
import { HTTPSTATUS } from '../config/http.config';
import { joinWorkspaceByInviteCodeService } from '../services/member.service';

export const joinWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const inviteCode = z.string().parse(req.params.inviteCode);
    const userId = req.user?._id;
    const { workspaceId, role } = await joinWorkspaceByInviteCodeService(
      userId,
      inviteCode
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Joined workspace successfully',
      workspaceId,
      role,
    });
  }
);

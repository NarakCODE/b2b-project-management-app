import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { config } from '../config/app.config';
import { registerSchema } from '../validations/auth.validation';
import { HTTPSTATUS } from '../config/http.config';
import { registerUserService } from '../services/auth.service';
import passport from 'passport';

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }
    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: 'User created successfully',
    });
  }
);

// Register multiple users at once
// export const registerUserController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const body = registerSchema.array().parse(req.body); // Validate an array of users

//     await Promise.all(body.map(user => registerUserService(user))); // Process all users

//     return res.status(HTTPSTATUS.CREATED).json({
//       message: 'Users created successfully',
//     });
//   }
// );

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('Login Controller');

    passport.authenticate(
      'local',
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || 'Invalid email or password',
          });
        }

        req.login(user, err => {
          if (err) {
            return next(err);
          }

          return res.status(HTTPSTATUS.OK).json({
            message: 'Logged in successfully',
            user,
          });
        });
      }
    )(req, res, next);
  }
);

export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Destroy the session
      req.session.destroy(err => {
        if (err) {
          console.error('Session destruction error:', err);
          return res
            .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to log out' });
        }

        // Clear the session cookie
        res.clearCookie('session'); // Match the name used in configuration

        // Clear JWT cookie with comprehensive configuration
        // res.clearCookie('jwt');
        return res
          .status(HTTPSTATUS.OK)
          .json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res
        .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to log out' });
    }
  }
);

// export const logOutController = asyncHandler(
//   async (req: Request, res: Response) => {
//     req.logout(err => {
//       if (err) {
//         console.error('Logout error:', err);
//         return res
//           .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
//           .json({ error: 'Failed to log out' });
//       }
//     });

//     (req as any).session = null;
//     return res
//       .status(HTTPSTATUS.OK)
//       .json({ message: 'Logged out successfully' });
//   }
// );

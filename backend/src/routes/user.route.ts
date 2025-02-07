import { Router } from 'express';
import {
  getCurrentUserController,
  getUserByIdController,
  updateUserController,
} from '../controllers/user.controller';

const userRoutes = Router();

userRoutes.get('/current', getCurrentUserController);
userRoutes.get('/:id', getUserByIdController);
userRoutes.put('/:userId', updateUserController);

export default userRoutes;

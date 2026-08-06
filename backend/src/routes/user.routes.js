import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getUsers, getUserById, updateUser } from '../controllers/shared.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', protect, authorize('ADMIN'), asyncHandler(getUsers));
router.get('/:id', protect, authorize('ADMIN'), asyncHandler(getUserById));
router.put('/:id', protect, authorize('ADMIN'), asyncHandler(updateUser));
export default router;

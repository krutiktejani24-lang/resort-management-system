// blog.routes.js
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getPosts, getPostBySlug, createPost, updatePost, deletePost } from '../controllers/blog.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', optionalAuth, asyncHandler(getPosts));
router.get('/:slug', optionalAuth, asyncHandler(getPostBySlug));
router.post('/', protect, authorize('ADMIN', 'STAFF'), asyncHandler(createPost));
router.put('/:id', protect, authorize('ADMIN', 'STAFF'), asyncHandler(updatePost));
router.delete('/:id', protect, authorize('ADMIN'), asyncHandler(deletePost));
export default router;

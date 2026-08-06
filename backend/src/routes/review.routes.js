import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { createReview, getReviews, approveReview, respondToReview, deleteReview } from '../controllers/shared.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', optionalAuth, asyncHandler(getReviews));
router.post('/', protect, asyncHandler(createReview));
router.put('/:id/approve', protect, authorize('ADMIN', 'STAFF'), asyncHandler(approveReview));
router.put('/:id/respond', protect, authorize('ADMIN', 'STAFF'), asyncHandler(respondToReview));
router.delete('/:id', protect, authorize('ADMIN'), asyncHandler(deleteReview));
export default router;

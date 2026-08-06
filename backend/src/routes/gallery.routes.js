import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../controllers/shared.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', asyncHandler(getGallery));
router.post('/', protect, authorize('ADMIN', 'STAFF'), asyncHandler(createGalleryItem));
router.put('/:id', protect, authorize('ADMIN', 'STAFF'), asyncHandler(updateGalleryItem));
router.delete('/:id', protect, authorize('ADMIN'), asyncHandler(deleteGalleryItem));
export default router;

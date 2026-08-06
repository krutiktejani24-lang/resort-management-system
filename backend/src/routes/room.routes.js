import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getRooms, getRoomBySlug, createRoom, updateRoom, deleteRoom,
  getRoomAvailability, getRoomCategories, createRoomCategory, getRoomTypes
} from '../controllers/room.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', asyncHandler(getRooms));
router.get('/types', asyncHandler(getRoomTypes));
router.get('/availability', asyncHandler(getRoomAvailability));
router.get('/categories', asyncHandler(getRoomCategories));
router.get('/:slug', asyncHandler(getRoomBySlug));
router.post('/', protect, authorize('ADMIN', 'STAFF'), asyncHandler(createRoom));
router.put('/:id', protect, authorize('ADMIN', 'STAFF'), asyncHandler(updateRoom));
router.delete('/:id', protect, authorize('ADMIN'), asyncHandler(deleteRoom));
router.post('/categories', protect, authorize('ADMIN'), asyncHandler(createRoomCategory));

export default router;

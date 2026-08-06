// booking.routes.js
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createBooking, getMyBookings, getBookingById, getAllBookings,
  updateBookingStatus, cancelBooking
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', protect, asyncHandler(createBooking));
router.get('/my', protect, asyncHandler(getMyBookings));
router.get('/:id', protect, asyncHandler(getBookingById));
router.get('/', protect, authorize('ADMIN', 'STAFF'), asyncHandler(getAllBookings));
router.put('/:id/status', protect, authorize('ADMIN', 'STAFF'), asyncHandler(updateBookingStatus));
router.put('/:id/cancel', protect, asyncHandler(cancelBooking));

export default router;

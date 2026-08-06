import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getDashboardStats, getRevenueReport, getOccupancyReport } from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/dashboard', protect, authorize('ADMIN', 'STAFF'), asyncHandler(getDashboardStats));
router.get('/revenue', protect, authorize('ADMIN'), asyncHandler(getRevenueReport));
router.get('/occupancy', protect, authorize('ADMIN', 'STAFF'), asyncHandler(getOccupancyReport));
export default router;

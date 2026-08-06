import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { createLead, getLeads, updateLead } from '../controllers/shared.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', optionalAuth, asyncHandler(createLead));
router.get('/', protect, authorize('ADMIN', 'STAFF'), asyncHandler(getLeads));
router.put('/:id', protect, authorize('ADMIN', 'STAFF'), asyncHandler(updateLead));
export default router;

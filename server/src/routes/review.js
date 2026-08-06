// server/src/routes/review.js — Officer Review & Action Routes
import { Router } from 'express';
import { getReviewQueue, assignComplaint, overrideComplaint, mergeComplaint, getOfficerDashboard, updateOfficerAction } from '../controllers/review.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

export const reviewRoutes = Router();

const officerOnly = [authenticate, requireRole('officer', 'department_admin', 'super_admin')];

reviewRoutes.get('/', ...officerOnly, getReviewQueue);
reviewRoutes.get('/dashboard', ...officerOnly, getOfficerDashboard);
reviewRoutes.get('/summary', ...officerOnly, getOfficerDashboard);
reviewRoutes.post('/:id/assign', ...officerOnly, assignComplaint);
reviewRoutes.post('/:id/override', ...officerOnly, overrideComplaint);
reviewRoutes.post('/:id/merge', ...officerOnly, mergeComplaint);
reviewRoutes.post('/:id/action', ...officerOnly, upload.array('files', 5), updateOfficerAction);
reviewRoutes.put('/:id/action', ...officerOnly, upload.array('files', 5), updateOfficerAction);

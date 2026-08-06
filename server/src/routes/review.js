// server/src/routes/review.js
import { Router } from 'express';
import { getReviewQueue, assignComplaint, overrideComplaint, mergeComplaint, getOfficerDashboard } from '../controllers/review.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const reviewRoutes = Router();

const officerOnly = [authenticate, requireRole('officer', 'department_admin', 'super_admin')];

reviewRoutes.get('/', ...officerOnly, getReviewQueue);
reviewRoutes.get('/dashboard', ...officerOnly, getOfficerDashboard);
reviewRoutes.get('/summary', ...officerOnly, getOfficerDashboard);
reviewRoutes.post('/:id/assign', ...officerOnly, assignComplaint);
reviewRoutes.post('/:id/override', ...officerOnly, overrideComplaint);
reviewRoutes.post('/:id/merge', ...officerOnly, mergeComplaint);

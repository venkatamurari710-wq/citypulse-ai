// server/src/routes/complaints.js
import { Router } from 'express';
import { listComplaints, createComplaint, getComplaint, updateComplaint, reanalyzeComplaint, closeComplaint } from '../controllers/complaints.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter, generalLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';

export const complaintRoutes = Router();

complaintRoutes.use(authenticate);
complaintRoutes.get('/', generalLimiter, listComplaints);
complaintRoutes.post('/', aiLimiter, upload.array('files', 10), createComplaint);
complaintRoutes.get('/:id', generalLimiter, getComplaint);
complaintRoutes.put('/:id', generalLimiter, updateComplaint);
complaintRoutes.post('/:id/reanalyze', aiLimiter, reanalyzeComplaint);
complaintRoutes.post('/:id/close', generalLimiter, closeComplaint);

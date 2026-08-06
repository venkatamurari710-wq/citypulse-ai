// server/src/routes/insights.js
import { Router } from 'express';
import { getSummary, getTrends, getHotspots } from '../controllers/insights.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const insightRoutes = Router();

const officerPlus = [authenticate, requireRole('officer', 'department_admin', 'super_admin')];
insightRoutes.get('/summary', ...officerPlus, getSummary);
insightRoutes.get('/trends', ...officerPlus, getTrends);
insightRoutes.get('/hotspots', ...officerPlus, getHotspots);

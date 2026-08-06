// server/src/routes/admin.js
import { Router } from 'express';
import { listUsers, toggleUserActive, listAllComplaints, getAdminStats, getAuditLogs } from '../controllers/admin.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const adminRoutes = Router();

const adminOnly = [authenticate, requireRole('department_admin', 'super_admin')];
const superOnly = [authenticate, requireRole('super_admin')];

adminRoutes.get('/users', ...adminOnly, listUsers);
adminRoutes.patch('/users/:id/toggle-active', ...superOnly, toggleUserActive);
adminRoutes.get('/complaints', ...adminOnly, listAllComplaints);
adminRoutes.get('/stats', ...adminOnly, getAdminStats);
adminRoutes.get('/audit-logs', ...superOnly, getAuditLogs);

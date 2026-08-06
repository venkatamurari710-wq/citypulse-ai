// server/src/routes/departments.js
import { Router } from 'express';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment, listDepartmentOfficers } from '../controllers/departments.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

export const departmentRoutes = Router();

departmentRoutes.get('/', generalLimiter, listDepartments);
departmentRoutes.get('/officers', generalLimiter, listDepartmentOfficers);
departmentRoutes.post('/', authenticate, requireRole('department_admin', 'super_admin'), createDepartment);
departmentRoutes.put('/:id', authenticate, requireRole('department_admin', 'super_admin'), updateDepartment);
departmentRoutes.delete('/:id', authenticate, requireRole('super_admin'), deleteDepartment);

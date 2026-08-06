// server/src/routes/routingRules.js
import { Router } from 'express';
import { listRoutingRules, createRoutingRule, updateRoutingRule, deleteRoutingRule } from '../controllers/routingRules.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const routingRuleRoutes = Router();

routingRuleRoutes.get('/', authenticate, requireRole('officer', 'department_admin', 'super_admin'), listRoutingRules);
routingRuleRoutes.post('/', authenticate, requireRole('department_admin', 'super_admin'), createRoutingRule);
routingRuleRoutes.put('/:id', authenticate, requireRole('department_admin', 'super_admin'), updateRoutingRule);
routingRuleRoutes.delete('/:id', authenticate, requireRole('super_admin'), deleteRoutingRule);

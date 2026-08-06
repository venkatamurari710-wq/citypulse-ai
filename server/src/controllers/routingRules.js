// server/src/controllers/routingRules.js
import { supabase } from '../config/supabase.js';
import { routingRuleCreateSchema, routingRuleUpdateSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';
import { logAudit, getAuditMeta } from '../services/audit.js';

export async function listRoutingRules(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('routing_rules')
      .select('*, departments(id, name)')
      .order('priority_weight', { ascending: false });
    if (error) return next(createError(500, error.message));
    res.json({ rules: data });
  } catch (err) { next(err); }
}

export async function createRoutingRule(req, res, next) {
  try {
    const validated = routingRuleCreateSchema.parse(req.body);
    const { data, error } = await supabase.from('routing_rules').insert(validated).select('*, departments(id, name)').single();
    if (error) return next(createError(500, error.message));
    await logAudit({ user_id: req.user.id, action: 'routing_rule_created', metadata: validated, ...getAuditMeta(req) });
    res.status(201).json({ rule: data });
  } catch (err) { next(err); }
}

export async function updateRoutingRule(req, res, next) {
  try {
    const { id } = req.params;
    const validated = routingRuleUpdateSchema.parse(req.body);
    const { data, error } = await supabase.from('routing_rules').update(validated).eq('id', id).select('*, departments(id, name)').single();
    if (error || !data) return next(createError(404, 'Routing rule not found'));
    await logAudit({ user_id: req.user.id, action: 'routing_rule_updated', metadata: { id, ...validated }, ...getAuditMeta(req) });
    res.json({ rule: data });
  } catch (err) { next(err); }
}

export async function deleteRoutingRule(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('routing_rules').delete().eq('id', id);
    if (error) return next(createError(500, error.message));
    await logAudit({ user_id: req.user.id, action: 'routing_rule_deleted', metadata: { id }, ...getAuditMeta(req) });
    res.json({ message: 'Routing rule deleted' });
  } catch (err) { next(err); }
}

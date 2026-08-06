// server/src/routes/debug.js — Debug Endpoint for Department Officers (ESM)
import { Router } from 'express';
import { supabase } from '../config/supabase.js';

export const debugRoutes = Router();

// DEBUG ONLY: returns raw department_officers join
debugRoutes.get('/department-officers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('department_officers')
      .select('id, user_id, department_id, officer_title, active, departments(name)');

    if (error) {
      console.error('DEBUG /department-officers error', error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    const rows = (data || []).map(r => ({
      id: r.id,
      user_id: r.user_id,
      department_id: r.department_id,
      officer_title: r.officer_title,
      active: r.active,
      department_name: r.departments?.name || 'Unknown',
    }));

    return res.json({ ok: true, rows });
  } catch (err) {
    console.error('DEBUG /department-officers exception', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

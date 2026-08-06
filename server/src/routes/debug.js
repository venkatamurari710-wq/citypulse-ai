// server/src/routes/debug.js — Debug Endpoint for Routing Trace & Department Auditing
import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { CANONICAL_DEPARTMENTS } from '../services/officerRegistry.js';

export const debugRoutes = Router();

// DEBUG TRACE ENDPOINT (Step 9)
debugRoutes.get('/routing-trace', async (req, res) => {
  try {
    const { data: departments } = await supabase.from('departments').select('id, name');
    const { data: complaints } = await supabase
      .from('complaints')
      .select('id, title, issue_category, department_id, status, created_at, departments(id, name)')
      .order('created_at', { ascending: false });

    const traceResults = (departments || []).map(dept => {
      const matchingComplaints = (complaints || []).filter(c => c.department_id === dept.id);
      return {
        officerDepartment: dept.name,
        departmentId: dept.id,
        supabaseQuery: `SELECT * FROM complaints WHERE department_id = '${dept.id}'`,
        numberOfComplaintsReturned: matchingComplaints.length,
        complaints: matchingComplaints.map(c => ({
          id: c.id,
          title: c.title,
          complaintCategory: c.issue_category,
          assignedDepartment: c.departments?.name || dept.name,
          status: c.status,
        })),
      };
    });

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      departments: traceResults,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

debugRoutes.get('/department-officers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, description');

    return res.json({ ok: true, departments: data || [] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

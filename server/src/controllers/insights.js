// server/src/controllers/insights.js — Analytics & Hotspot Insights
import { supabase } from '../config/supabase.js';
import { createError } from '../middleware/errorHandler.js';

export async function getSummary(req, res, next) {
  try {
    const [totalResult, pendingResult, resolvedResult, criticalResult] = await Promise.all([
      supabase.from('complaints').select('id', { count: 'exact', head: true }),
      supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['pending', 'needs_review', 'analyzing']),
      supabase.from('complaints').select('id', { count: 'exact', head: true }).in('status', ['resolved', 'closed']),
      supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('severity', 'critical').not('status', 'in', '("resolved","closed")'),
    ]);

    const categoryCounts = await supabase
      .from('complaints')
      .select('issue_category')
      .not('issue_category', 'is', null);

    const categoryMap = {};
    (categoryCounts.data || []).forEach(c => {
      categoryMap[c.issue_category] = (categoryMap[c.issue_category] || 0) + 1;
    });

    res.json({
      total: totalResult.count || 0,
      pending: pendingResult.count || 0,
      resolved: resolvedResult.count || 0,
      critical: criticalResult.count || 0,
      by_category: categoryMap,
    });
  } catch (err) { next(err); }
}

export async function getTrends(req, res, next) {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('complaints')
      .select('created_at, issue_category, severity, status')
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) return next(createError(500, error.message));

    // Group by day
    const byDay = {};
    (data || []).forEach(c => {
      const day = c.created_at.split('T')[0];
      if (!byDay[day]) byDay[day] = { date: day, total: 0, critical: 0, resolved: 0 };
      byDay[day].total++;
      if (c.severity === 'critical') byDay[day].critical++;
      if (['resolved', 'closed'].includes(c.status)) byDay[day].resolved++;
    });

    res.json({ trends: Object.values(byDay) });
  } catch (err) { next(err); }
}

export async function getHotspots(req, res, next) {
  try {
    // Find complaint clusters by location
    const { data, error } = await supabase
      .from('complaints')
      .select('id, latitude, longitude, issue_category, severity, status, address_text, created_at')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .not('status', 'in', '("closed","resolved")')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) return next(createError(500, error.message));

    // Simple grid clustering: 0.01 degree cells (~1km)
    const GRID_SIZE = 0.01;
    const clusters = {};
    (data || []).forEach(c => {
      const gridLat = Math.round(c.latitude / GRID_SIZE) * GRID_SIZE;
      const gridLon = Math.round(c.longitude / GRID_SIZE) * GRID_SIZE;
      const key = `${gridLat}_${gridLon}`;
      if (!clusters[key]) {
        clusters[key] = {
          latitude: gridLat, longitude: gridLon,
          count: 0, critical: 0, categories: {},
          area_name: c.address_text || `${gridLat.toFixed(3)},${gridLon.toFixed(3)}`,
        };
      }
      clusters[key].count++;
      if (c.severity === 'critical') clusters[key].critical++;
      clusters[key].categories[c.issue_category] = (clusters[key].categories[c.issue_category] || 0) + 1;
    });

    const hotspots = Object.values(clusters)
      .filter(h => h.count >= 2)
      .map(h => ({
        ...h,
        risk_score: Math.min(100, h.count * 10 + h.critical * 20),
        top_category: Object.entries(h.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
      }))
      .sort((a, b) => b.risk_score - a.risk_score);

    res.json({ hotspots });
  } catch (err) { next(err); }
}

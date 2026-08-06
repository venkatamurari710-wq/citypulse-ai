// client/src/pages/officer/HotspotsPage.jsx
import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import api from '../../services/api';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { PageLoader } from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights/hotspots')
      .then(res => setHotspots(res.data.hotspots || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const center = hotspots.length > 0
    ? [hotspots[0].latitude, hotspots[0].longitude]
    : [20.5937, 78.9629];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Flame className="w-7 h-7 text-rose-600" /> Hotspot Intelligence
        </h1>
        <p className="text-neutral-500 text-sm mt-1 font-medium">Geographic clusters of unresolved civic complaints with elevated risk</p>
      </div>

      {hotspots.length === 0 ? (
        <EmptyState icon={Flame} title="No hotspots detected" description="Hotspots appear when 2+ complaints cluster in the same area." />
      ) : (
        <>
          <div className="card overflow-hidden shadow-sm" style={{ height: '50vh' }}>
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hotspots.map((h, i) => (
                <Circle
                  key={i}
                  center={[h.latitude, h.longitude]}
                  radius={Math.max(300, h.count * 80)}
                  pathOptions={{
                    color: h.risk_score > 60 ? '#dc2626' : h.risk_score > 30 ? '#ea580c' : '#d97706',
                    fillOpacity: 0.25, weight: 2,
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-neutral-900 text-sm">{h.area_name}</p>
                      <p className="text-xs text-neutral-600 font-medium">{h.count} complaints · Risk: {h.risk_score}</p>
                      <p className="text-xs text-neutral-500 capitalize">{h.top_category?.replace(/_/g, ' ')}</p>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotspots.slice(0, 12).map((h, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-neutral-900 text-sm">{h.area_name}</p>
                  <span className={`badge border text-xs ${
                    h.risk_score > 60 ? 'badge-danger' : h.risk_score > 30 ? 'badge-warning' : 'badge-ghost'
                  }`}>
                    Risk: {h.risk_score}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium capitalize">{h.count} complaints · {h.top_category?.replace(/_/g, ' ')}</p>
                <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, h.risk_score)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

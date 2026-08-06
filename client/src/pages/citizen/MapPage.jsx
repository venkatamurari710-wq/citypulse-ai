// client/src/pages/citizen/MapPage.jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import { PageLoader } from '../../components/shared/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapPage() {
  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [centerPos, setCenterPos] = useState([20.5937, 78.9629]);

  useEffect(() => {
    async function load() {
      try {
        const [compRes, hotspotRes] = await Promise.all([
          api.get('/complaints?limit=200'),
          api.get('/insights/hotspots').catch(() => ({ data: { hotspots: [] } })),
        ]);
        const withLocation = (compRes.data.complaints || []).filter(c => c.latitude && c.longitude);
        setComplaints(withLocation);
        setHotspots(hotspotRes.data.hotspots || []);
        if (withLocation.length > 0) {
          setCenterPos([parseFloat(withLocation[0].latitude), parseFloat(withLocation[0].longitude)]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">City Map View</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Geographic distribution of reported civic issues</p>
        </div>
        <button
          onClick={() => setShowHotspots(h => !h)}
          className={`btn-sm ${showHotspots ? 'btn-accent' : 'btn-ghost'}`}
        >
          {showHotspots ? '🔥 Hotspots Visible' : '🔥 Show Hotspots'}
        </button>
      </div>

      <div className="card overflow-hidden shadow-sm" style={{ height: '70vh' }}>
        <MapContainer center={centerPos} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showHotspots && hotspots.map((h, i) => (
            <Circle
              key={i}
              center={[h.latitude, h.longitude]}
              radius={500}
              pathOptions={{ color: '#ef4444', fillColor: '#f87171', fillOpacity: 0.25, weight: 2 }}
            />
          ))}

          {complaints.map(c => (
            <Marker key={c.id} position={[parseFloat(c.latitude), parseFloat(c.longitude)]}>
              <Popup>
                <div className="min-w-[200px] p-1">
                  <p className="font-bold text-neutral-900 text-sm mb-1">{c.title}</p>
                  {c.address_text && <p className="text-xs text-neutral-600 mb-2 font-medium">{c.address_text}</p>}
                  <div className="flex gap-1 flex-wrap mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase ${
                      c.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                      c.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      c.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>{c.severity || 'normal'}</span>
                    <span className="text-xs text-neutral-500 font-medium">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <a href={`/complaints/${c.id}`} className="text-xs font-bold text-primary-600 hover:text-primary-700">View details →</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex gap-4 text-xs font-semibold text-neutral-500 flex-wrap">
        <span>📍 {complaints.length} complaints on map</span>
        {showHotspots && <span>🔥 {hotspots.length} hotspot clusters detected</span>}
      </div>
    </div>
  );
}

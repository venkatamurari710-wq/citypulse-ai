// client/src/components/map/MapPreview.jsx
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.setView([lat, lon], 15);
  }, [lat, lon, map]);
  return null;
}

export default function MapPreview({ latitude, longitude, address, height = '250px' }) {
  if (!latitude || !longitude) return (
    <div className="w-full rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center" style={{ height }}>
      <p className="text-neutral-500 text-sm font-medium">No location data</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm" style={{ height }}>
      <MapContainer center={[latitude, longitude]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          {address && <Popup><span className="text-neutral-800 font-medium">{address}</span></Popup>}
        </Marker>
        <RecenterMap lat={latitude} lon={longitude} />
      </MapContainer>
    </div>
  );
}

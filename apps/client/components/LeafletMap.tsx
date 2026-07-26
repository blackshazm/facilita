'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically change map view when location updates
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

interface LeafletMapProps {
  location: { lat: number; lng: number } | null;
  mapType: 'streets' | 'satellite';
}

export default function LeafletMap({ location, mapType }: LeafletMapProps) {
  const defaultCenter: [number, number] = [-23.5505, -46.6333]; // SP default
  const center: [number, number] = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
      {mapType === 'streets' ? (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OSM'
        />
      ) : (
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution='&copy; Google'
        />
      )}
      
      <ChangeView center={center} />
      <Marker position={center}>
        <Popup>
          <strong>O profissional está aqui!</strong>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

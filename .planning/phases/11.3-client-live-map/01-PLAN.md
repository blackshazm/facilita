---
wave: 1
depends_on:
  - Phase 11.1
files_modified:
  - apps/client/src/lib/socket.ts
  - apps/client/src/components/LiveMap.tsx
  - apps/client/src/app/tracking/[id]/page.tsx
autonomous: true
requirements:
  - TRACK-03
---

# Phase 11.3: Client Live Map

## Tasks

### 1. Create Socket Connection Helper
<read_first>
- apps/client/package.json
</read_first>
<action>
Create `apps/client/src/lib/socket.ts`:
```typescript
import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
});
```
</action>
<acceptance_criteria>
- `apps/client/src/lib/socket.ts` exists and exports `socket` instance
</acceptance_criteria>

### 2. Create LiveMap Component
<read_first>
- apps/client/package.json
</read_first>
<action>
Create `apps/client/src/components/LiveMap.tsx`:
```typescript
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix Leaflet's default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LiveMapProps {
  lat: number;
  lng: number;
}

export default function LiveMap({ lat, lng }: LiveMapProps) {
  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 z-0 relative">
      <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
```
</action>
<acceptance_criteria>
- `apps/client/src/components/LiveMap.tsx` exports default component using `MapContainer`
</acceptance_criteria>

### 3. Update Tracking Page Logic
<read_first>
- apps/client/src/app/tracking/[id]/page.tsx
- apps/client/src/components/LiveMap.tsx
- apps/client/src/lib/socket.ts
</read_first>
<action>
Modify `apps/client/src/app/tracking/[id]/page.tsx`:
1. Use `useParams` to get the `id`.
2. Add state for `location` (lat, lng), `isConnected`, and `signalLost`.
3. Set up `useEffect` to manage `socket.connect()` and `socket.emit('subscribeToOrder', id)`.
4. Listen for `locationUpdated`. When received, update the `location` state, set `signalLost` to `false`, and reset a 30s timeout that triggers `signalLost = true` if no updates arrive.
5. Dynamically import the map: `const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });`
6. Render the map if `location` exists. If `signalLost` is true, show a red warning banner over the map indicating "Sinal do provedor perdido".
</action>
<acceptance_criteria>
- `apps/client/src/app/tracking/[id]/page.tsx` contains `ssr: false` dynamic import
- `apps/client/src/app/tracking/[id]/page.tsx` connects to `socket` on mount
- `apps/client/src/app/tracking/[id]/page.tsx` implements 30s signal loss logic
</acceptance_criteria>

## Verification
- Run `npm run build` in `apps/client` to verify Next.js builds successfully.

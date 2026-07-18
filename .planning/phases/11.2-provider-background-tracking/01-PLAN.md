---
wave: 1
depends_on:
  - Phase 11.1
files_modified:
  - apps/provider/package.json
  - apps/provider/src/services/socket.service.ts
  - apps/provider/src/services/location.service.ts
  - apps/provider/App.tsx
autonomous: true
requirements:
  - TRACK-02
---

# Phase 11.2: Provider Background Tracking

## Tasks

### 1. Install Expo Task Manager
<read_first>
- apps/provider/package.json
</read_first>
<action>
Run `npm install expo-task-manager` inside `apps/provider` or manually add `"expo-task-manager": "~11.8.2"` to the dependencies in `package.json`.
</action>
<acceptance_criteria>
- `apps/provider/package.json` contains `expo-task-manager`
</acceptance_criteria>

### 2. Create Socket Service
<read_first>
- apps/provider/src/services/socket.service.ts (new)
</read_first>
<action>
Create `apps/provider/src/services/socket.service.ts`:
```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private backendUrl = 'http://localhost:3333'; // Em produção viria do .env

  connect() {
    if (!this.socket) {
      this.socket = io(this.backendUrl, { transports: ['websocket'] });
      this.socket.on('connect', () => console.log('Socket connected:', this.socket?.id));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinOrderRoom(orderId: string) {
    if (this.socket) {
      this.socket.emit('subscribeToOrder', orderId);
    }
  }

  sendLocationUpdate(orderId: string, lat: number, lng: number, heading?: number) {
    if (this.socket) {
      this.socket.emit('updateLocation', { orderId, lat, lng, heading });
    }
  }
}

export const socketService = new SocketService();
```
</action>
<acceptance_criteria>
- `apps/provider/src/services/socket.service.ts` exists and exports `socketService`
</acceptance_criteria>

### 3. Update Location Service for Background Tracking
<read_first>
- apps/provider/src/services/location.service.ts
</read_first>
<action>
Modify `apps/provider/src/services/location.service.ts`:
1. Import `* as TaskManager from 'expo-task-manager';`
2. Import `socketService` from `./socket.service`.
3. Define a task constant: `const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';`
4. Define the task outside the class:
```typescript
let activeOrderId: string | null = null;

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }: any) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data && activeOrderId) {
    const { locations } = data;
    const loc = locations[0];
    socketService.sendLocationUpdate(activeOrderId, loc.coords.latitude, loc.coords.longitude, loc.coords.heading);
  }
});
```
5. Add to `LocationService` class:
```typescript
  static async requestBackgroundPermissionsAsync(): Promise<boolean> {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') return false;
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    return bgStatus === 'granted';
  }

  static async startBackgroundTracking(orderId: string) {
    const hasPermission = await this.requestBackgroundPermissionsAsync();
    if (!hasPermission) return;
    activeOrderId = orderId;
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 10,
      deferredUpdatesInterval: 10000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Facilita',
        notificationBody: 'Rastreando localização da ordem de serviço',
      },
    });
  }

  static async stopBackgroundTracking() {
    activeOrderId = null;
    const hasTask = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (hasTask) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  }
```
</action>
<acceptance_criteria>
- `apps/provider/src/services/location.service.ts` contains `TaskManager.defineTask`
- `apps/provider/src/services/location.service.ts` contains `startBackgroundTracking`
</acceptance_criteria>

### 4. Initialize Socket in App.tsx
<read_first>
- apps/provider/App.tsx
</read_first>
<action>
Modify `apps/provider/App.tsx` to import `socketService` and initialize it.
```typescript
import { useEffect } from 'react';
import { socketService } from './src/services/socket.service';

// Inside App component:
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);
```
</action>
<acceptance_criteria>
- `apps/provider/App.tsx` calls `socketService.connect()`
</acceptance_criteria>

## Verification
- Run `npm run build` or `npx tsc --noEmit` in `apps/provider` to verify TypeScript typings.

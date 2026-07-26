import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { socketService } from './socket.service';

export interface Coords {
  latitude: number;
  longitude: number;
  heading?: number;
}

const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

let activeOrderId: string | null = null;

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data && activeOrderId) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const loc = locations[0];
      socketService.sendLocationUpdate(
        activeOrderId,
        loc.coords.latitude,
        loc.coords.longitude,
        loc.coords.heading
      );
    }
  }
});

export class LocationService {
  static async requestForegroundPermissionsAsync(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  static async requestBackgroundPermissionsAsync(): Promise<boolean> {
    const hasForeground = await this.requestForegroundPermissionsAsync();
    if (!hasForeground) return false;

    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status === 'granted';
  }

  static async getCurrentLocation(): Promise<Coords | null> {
    try {
      const hasPermission = await this.requestForegroundPermissionsAsync();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || undefined,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  static async watchLocation(callback: (coords: Coords) => void) {
    const hasPermission = await this.requestForegroundPermissionsAsync();
    if (!hasPermission) return;

    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading || undefined,
        });
      }
    );
  }

  static async startBackgroundTracking(orderId: string) {
    const hasPermission = await this.requestBackgroundPermissionsAsync();
    if (!hasPermission) {
      console.warn('Permissão de background negada');
      return;
    }
    
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
    try {
      const hasTask = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (hasTask) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }
    } catch (e) {
      console.error('Failed to stop background tracking', e);
    }
  }
}

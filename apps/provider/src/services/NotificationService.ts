import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

export const setupUrgentNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('urgency_dispatch_channel', {
      name: 'Chamados Urgentes FACILITA',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lightColor: '#10B981',
      sound: 'alert_siren.wav',
      enableVibrate: true,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
    });
  }
};

export const registerForPushNotificationsAsync = async (userId: string) => {
  await setupUrgentNotificationChannel();

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  // V2 Hardening: Passagem explícita do ProjectId para evitar erros em prod
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'facilita-provider-mobile',
  })).data;

  console.log('Expo Push Token:', token);

  // Envia para o backend
  try {
    await axios.post(`${API_URL}/identity/notifications/register-device`, {
      pushToken: token,
      platform: Platform.OS,
      deviceId: Device.osBuildId,
    });
  } catch (error) {
    console.error('Failed to register device on backend:', error);
  }

  return token;
};

export const configureNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

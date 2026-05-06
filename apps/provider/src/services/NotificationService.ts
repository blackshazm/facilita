import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';

const API_URL = 'https://api.facilita.com.br';

export const registerForPushNotificationsAsync = async (userId: string) => {
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
    projectId: 'your-expo-project-id', // Substituir pelo ID real do projeto Expo
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

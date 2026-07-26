import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { configureNotificationHandler } from './src/services/NotificationService';
import { OfflineBanner } from './src/components/OfflineBanner';
import { socketService } from './src/services/socket.service';

export default function App() {
  useEffect(() => {
    configureNotificationHandler();
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <AppNavigator />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
});

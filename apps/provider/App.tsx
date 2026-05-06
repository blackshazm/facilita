import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { configureNotificationHandler } from './src/services/NotificationService';
import { OfflineBanner } from './src/components/OfflineBanner';

export default function App() {
  useEffect(() => {
    configureNotificationHandler();
  }, []);

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <RegisterScreen />
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

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { RegisterScreen } from './src/screens/RegisterScreen';

export default function App() {
  return (
    <View style={styles.container}>
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

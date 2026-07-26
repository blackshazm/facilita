import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';

// Mock config
const API_URL = 'http://10.0.2.2:3001'; 
const PROVIDER_ID = 'provider-123';

export default function ProviderLiveTracking() {
  const [matchingSocket, setMatchingSocket] = useState<Socket | null>(null);
  const [trackingSocket, setTrackingSocket] = useState<Socket | null>(null);
  
  const [incomingJob, setIncomingJob] = useState<any>(null);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [status, setStatus] = useState<'MATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS'>('MATCHED');

  useEffect(() => {
    // 1. Connect to Matching Gateway to receive Dispatches
    const matchSock = io(`${API_URL}/matching`, { transports: ['websocket'] });
    
    matchSock.on('connect', () => {
      matchSock.emit('authenticate', { providerId: PROVIDER_ID });
    });

    matchSock.on('new_dispatch', (data) => {
      console.log('Incoming Job:', data);
      setIncomingJob(data);
    });

    setMatchingSocket(matchSock);

    // 2. Connect to Tracking Gateway to transmit GPS once active
    const trackSock = io(`${API_URL}/tracking`, { transports: ['websocket'] });
    setTrackingSocket(trackSock);

    return () => {
      matchSock.disconnect();
      trackSock.disconnect();
    };
  }, []);

  // Simulate background GPS transmission when EN_ROUTE
  useEffect(() => {
    let interval: any;

    if (activeJob && status === 'EN_ROUTE') {
      interval = setInterval(async () => {
        const loc = await Location.getCurrentPositionAsync({});
        trackingSocket?.emit('update_location', {
          orderId: activeJob.orderId,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [activeJob, status, trackingSocket]);

  const acceptJob = () => {
    setActiveJob(incomingJob);
    setIncomingJob(null);
    setStatus('EN_ROUTE');
    
    // Broadcast status to client
    trackingSocket?.emit('update_status', { 
      orderId: incomingJob.orderId, 
      status: 'EN_ROUTE' 
    });
  };

  const updateStatus = (newStatus: 'ARRIVED' | 'IN_PROGRESS' | 'DONE') => {
    setStatus(newStatus as any);
    trackingSocket?.emit('update_status', { 
      orderId: activeJob.orderId, 
      status: newStatus 
    });
  };

  if (incomingJob) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🚨 Novo Chamado!</Text>
        <Text style={styles.text}>ID: {incomingJob.orderId}</Text>
        <Text style={styles.text}>Distância: {incomingJob.distance.toFixed(2)}m</Text>
        <TouchableOpacity style={styles.buttonAccept} onPress={acceptJob}>
          <Text style={styles.buttonText}>Aceitar Chamado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activeJob) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Chamado Ativo: {status}</Text>
        <Text style={styles.text}>Transmitindo GPS para o cliente...</Text>
        
        {status === 'EN_ROUTE' && (
          <TouchableOpacity style={styles.buttonAction} onPress={() => updateStatus('ARRIVED')}>
            <Text style={styles.buttonText}>Cheguei no Local</Text>
          </TouchableOpacity>
        )}
        
        {status === 'ARRIVED' && (
          <TouchableOpacity style={styles.buttonAction} onPress={() => updateStatus('IN_PROGRESS')}>
            <Text style={styles.buttonText}>Iniciar Serviço</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.text}>Aguardando chamados...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 8, margin: 16, elevation: 3 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  text: { fontSize: 16, marginBottom: 8 },
  buttonAccept: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonAction: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

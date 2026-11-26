import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StorageService } from '../services/StorageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

export default function NewJobAlertScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const order = route.params?.order || {
    id: 'ord-mock-1',
    serviceName: 'Instalação de Chuveiro',
    payoutAmount: 102.0,
    distanceKm: 2.5,
    estimatedMinutes: 10,
    clientName: 'Maria O.',
    clientRating: 5.0,
  };

  // v4.1: Janela de aceite com countdown de 180s (3 minutos)
  const [timeLeft, setTimeLeft] = useState(180);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleReject();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const profile = await StorageService.getProfile();
      const token = profile?.token;

      const response = await fetch(`${API_URL}/orders/${order.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok && response.status !== 401 && response.status !== 404) {
        console.warn('API /orders/:id/accept retornou status não-200');
      }

      await StorageService.saveActiveOrder(order);
      navigation.navigate('ActiveJob', { orderId: order.id });
    } catch (error) {
      console.warn('Fallback em modo offline ao aceitar serviço:', error);
      await StorageService.saveActiveOrder(order);
      navigation.navigate('ActiveJob', { orderId: order.id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const isUrgentTimer = timeLeft < 30;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.alertCard}>
          <View
            style={[
              styles.pulseIndicator,
              { backgroundColor: isUrgentTimer ? '#EF4444' : '#10B981' },
            ]}
          />

          {/* Countdown Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Tempo para aceitar:</Text>
            <Text
              style={[
                styles.timerValue,
                { color: isUrgentTimer ? '#EF4444' : '#064e3b' },
              ]}
            >
              ⏱️ {formatTime(timeLeft)}
            </Text>
          </View>

          <Text style={styles.title}>Novo Chamado Disponível!</Text>
          <Text style={styles.serviceName}>{order.serviceName}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ganhos (Líquido):</Text>
            <Text style={styles.infoValueHighlight}>
              R$ {Number(order.payoutAmount).toFixed(2)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distância:</Text>
            <Text style={styles.infoValue}>
              {order.distanceKm} km (Aprox. {order.estimatedMinutes} min)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>
              {order.clientName} (⭐ {order.clientRating || 5.0})
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleReject}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.rejectButtonText}>Recusar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, isLoading && styles.disabledButton]}
              onPress={handleAccept}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptButtonText}>Aceitar Serviço ✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  pulseIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  timerValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#064e3b',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  infoValueHighlight: {
    fontSize: 18,
    color: '#059669',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

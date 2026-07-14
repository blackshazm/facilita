import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

export default function NewJobAlertScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.alertCard}>
          <View style={styles.pulseIndicator} />
          
          <Text style={styles.title}>Novo Serviço Disponível!</Text>
          <Text style={styles.serviceName}>Instalação de Chuveiro</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ganhos (Líquido):</Text>
            <Text style={styles.infoValueHighlight}>R$ 102,00</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distância:</Text>
            <Text style={styles.infoValue}>2.5 km (Aprox. 10 min)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>Maria O. (⭐ 5.0)</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>Recusar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Aceitar Serviço</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  pulseIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#2563EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
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
    color: '#10B981',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  rejectButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

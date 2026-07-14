import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Phone, MapPin, CheckCircle2, Navigation } from 'lucide-react-native';

export default function ActiveJobScreen() {
  const [jobStatus, setJobStatus] = useState<'ACCEPTED' | 'IN_PROGRESS'>('ACCEPTED');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (jobStatus === 'ACCEPTED') {
        setJobStatus('IN_PROGRESS');
      } else {
        alert('Serviço Finalizado! Aguardando confirmação de pagamento.');
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <Navigation color="#6B7280" size={32} style={{ marginBottom: 12 }} />
        <Text style={styles.mapText}>Navegação até o Cliente</Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.clientName}>Maria O.</Text>
            <Text style={styles.serviceName}>Instalação de Chuveiro</Text>
          </View>
          <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
            <Phone color="#10B981" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.callButtonText}>Ligar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <MapPin color="#6B7280" size={16} />
            <Text style={styles.addressLabel}>Endereço do Local</Text>
          </View>
          <Text style={styles.addressText}>Rua das Flores, 123 - Apto 402</Text>
          <Text style={styles.addressSubtext}>Bairro Jardim Primavera</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.payoutContainer}>
          <Text style={styles.payoutLabel}>Ganhos (Líquido)</Text>
          <Text style={styles.payoutValue}>R$ 102,00</Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.actionButton, 
            jobStatus === 'IN_PROGRESS' && styles.finishButton,
            isLoading && styles.disabledButton
          ]}
          onPress={handleAction}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {jobStatus === 'ACCEPTED' ? (
                <Text style={styles.actionButtonText}>Cheguei e Iniciei o Serviço</Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle2 color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Finalizar Serviço</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#6B7280',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  clientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  serviceName: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  callButtonText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  addressContainer: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  addressSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  payoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  payoutLabel: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  payoutValue: {
    fontSize: 22,
    color: '#10B981',
    fontWeight: '900',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  finishButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  disabledButton: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Phone, MapPin, CheckCircle2, Navigation, Camera, AlertCircle, PlusCircle, WifiOff } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraPreview } from '../components/CameraPreview';
import { StorageService } from '../services/StorageService';
import { OfflineQueueService } from '../services/OfflineQueueService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

export default function ActiveJobScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderId = route.params?.orderId || 'ord-active-1';

  const [jobStatus, setJobStatus] = useState<'ACCEPTED' | 'IN_PROGRESS' | 'DONE'>('ACCEPTED');
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStep, setCameraStep] = useState<'BEFORE' | 'AFTER' | null>(null);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [hasPendingOfflineSync, setHasPendingOfflineSync] = useState(false);

  // Dados do pedido ativo
  const [orderData, setOrderData] = useState({
    id: orderId,
    clientName: 'Maria O.',
    clientPhone: '(11) 9****-4321', // Mascarado v4.1
    serviceName: 'Instalação de Chuveiro',
    address: 'Rua das Flores, 123 - Apto 402',
    neighborhood: 'Jardim Primavera',
    payoutAmount: 102.0,
  });

  useEffect(() => {
    // Carrega dados salvos se existirem
    (async () => {
      const cached = await StorageService.getActiveOrder();
      if (cached) {
        setOrderData((prev) => ({
          ...prev,
          ...cached,
        }));
      }

      const queue = await OfflineQueueService.getQueue();
      const hasOrderQueue = queue.some((q) => q.orderId === orderId);
      if (hasOrderQueue) {
        setHasPendingOfflineSync(true);
      }
    })();

    const unsubscribe = OfflineQueueService.initAutoSync(API_URL, (res) => {
      if (res.processed > 0) {
        setHasPendingOfflineSync(false);
        Alert.alert('Sincronizado! 🚀', 'As fotos e ações gravadas offline foram enviadas com sucesso para a central.');
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  const handleOpenPhoneCall = () => {
    // Proxy de chamada v4.1
    Alert.alert(
      'Chamada Protegida Facilita',
      `Iniciando ligação via número mascarado seguro para o cliente.\nSeu número pessoal e o do cliente estão protegidos contra vazamentos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Discar via Proxy',
          onPress: () => {
            Linking.openURL('tel:08001234567').catch(() => {
              Alert.alert('Erro', 'Não foi possível acionar o discador.');
            });
          },
        },
      ]
    );
  };

  const handleOpenWaze = async () => {
    const query = encodeURIComponent(`${orderData.address}, ${orderData.neighborhood}`);
    const wazeUrl = `waze://?q=${query}&navigate=yes`;
    const webFallback = `https://www.waze.com/ul?q=${query}&navigate=yes`;

    try {
      const supported = await Linking.canOpenURL(wazeUrl);
      if (supported) {
        await Linking.openURL(wazeUrl);
      } else {
        await Linking.openURL(webFallback);
      }
    } catch {
      await Linking.openURL(webFallback);
    }
  };

  const handleOpenGoogleMaps = async () => {
    const query = encodeURIComponent(`${orderData.address}, ${orderData.neighborhood}`);
    const mapsUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      const supported = await Linking.canOpenURL(mapsUrl);
      if (supported) {
        await Linking.openURL(mapsUrl);
      } else {
        await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      }
    } catch {
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handleStartFlow = () => {
    // v4.1 #39: Exige foto ANTES para destravar o início
    setCameraStep('BEFORE');
    setShowCamera(true);
  };

  const handleCompleteFlow = () => {
    // v4.1: Exige foto DEPOIS para destravar a conclusão
    setCameraStep('AFTER');
    setShowCamera(true);
  };

  const handlePhotoCaptured = async (uri: string) => {
    setShowCamera(false);
    setIsLoading(true);

    try {
      const profile = await StorageService.getProfile();
      const token = profile?.token;

      if (cameraStep === 'BEFORE') {
        setBeforePhotoUrl(uri);

        try {
          // 1. Envia evidência de foto ANTES
          const resEvid = await fetch(`${API_URL}/orders/${orderId}/evidence`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              type: 'BEFORE',
              url: uri,
            }),
          });
          if (!resEvid.ok) throw new Error('Falha HTTP ao salvar evidência');

          // 2. Destrava início do pedido
          const resStart = await fetch(`${API_URL}/orders/${orderId}/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!resStart.ok) throw new Error('Falha HTTP ao iniciar pedido');

          setJobStatus('IN_PROGRESS');
          Alert.alert(
            'Atendimento Iniciado! 🛠️',
            'Foto "Antes" registrada com sucesso. O cronômetro de execução e o chat seguro estão ativos.'
          );
        } catch (netErr) {
          console.warn('[ActiveJob] Sem sinal 4G. Enfileirando ações na fila offline local:', netErr);
          await OfflineQueueService.enqueue({
            type: 'ADD_EVIDENCE',
            orderId,
            endpoint: `/orders/${orderId}/evidence`,
            method: 'POST',
            payload: { type: 'BEFORE', url: uri },
          });
          await OfflineQueueService.enqueue({
            type: 'START_ORDER',
            orderId,
            endpoint: `/orders/${orderId}/start`,
            method: 'POST',
          });

          setHasPendingOfflineSync(true);
          setJobStatus('IN_PROGRESS');
          Alert.alert(
            'Salvo no Dispositivo 📶',
            'Você está sem sinal 4G no momento. A foto "Antes" e o início do atendimento foram salvos com segurança no seu celular e serão sincronizados automaticamente assim que a conexão retornar.'
          );
        }
      } else if (cameraStep === 'AFTER') {
        setAfterPhotoUrl(uri);

        try {
          const resComplete = await fetch(`${API_URL}/orders/${orderId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              beforeUrl: beforePhotoUrl || uri,
              afterUrl: uri,
            }),
          });
          if (!resComplete.ok) throw new Error('Falha HTTP ao concluir pedido');

          setJobStatus('DONE');
          Alert.alert(
            'Serviço Concluído! 🎉',
            'As fotos de comprovação foram enviadas para o cliente. O repasse será programado conforme seu nível.',
            [
              {
                text: 'Ver Carteira',
                onPress: () => navigation.navigate('Wallet'),
              },
            ]
          );
        } catch (netErr) {
          console.warn('[ActiveJob] Sem sinal 4G. Enfileirando conclusão na fila offline:', netErr);
          await OfflineQueueService.enqueue({
            type: 'COMPLETE_ORDER',
            orderId,
            endpoint: `/orders/${orderId}/complete`,
            method: 'POST',
            payload: {
              beforeUrl: beforePhotoUrl || uri,
              afterUrl: uri,
            },
          });

          setHasPendingOfflineSync(true);
          setJobStatus('DONE');
          Alert.alert(
            'Conclusão Salva no Dispositivo 🎉',
            'Você está sem sinal 4G. A conclusão do serviço e a foto "Depois" foram salvas com segurança no seu celular e serão sincronizadas assim que a conexão retornar.',
            [
              {
                text: 'Ver Carteira',
                onPress: () => navigation.navigate('Wallet'),
              },
            ]
          );
        }
      }
    } catch (err) {
      console.warn('Erro durante upload de foto:', err);
      if (cameraStep === 'BEFORE') {
        setJobStatus('IN_PROGRESS');
      } else {
        setJobStatus('DONE');
      }
    } finally {
      setIsLoading(false);
      setCameraStep(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal da Câmera para Foto Antes / Depois */}
      <Modal visible={showCamera} animationType="slide">
        <View style={{ flex: 1 }}>
          <View style={styles.cameraBanner}>
            <Text style={styles.cameraBannerTitle}>
              {cameraStep === 'BEFORE'
                ? '📷 Foto OBRIGATÓRIA: Estado Atual (Antes)'
                : '📷 Foto OBRIGATÓRIA: Resultado Final (Depois)'}
            </Text>
            <Text style={styles.cameraBannerSubtitle}>
              Garante a validação do serviço e protege contra contestações indevidas.
            </Text>
          </View>
          <CameraPreview
            onCapture={handlePhotoCaptured}
            onClose={() => {
              setShowCamera(false);
              setCameraStep(null);
            }}
          />
        </View>
      </Modal>

      {/* Map / Navegação */}
      <View style={styles.mapContainer}>
        <Navigation color="#064e3b" size={36} style={{ marginBottom: 12 }} />
        <Text style={styles.mapText}>Navegação Ativa até o Cliente</Text>
        <Text style={styles.mapSubtext}>GPS e Telemetria em Tempo Real</Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.clientName}>{orderData.clientName}</Text>
            <Text style={styles.serviceName}>{orderData.serviceName}</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleOpenPhoneCall}
            activeOpacity={0.7}
          >
            <Phone color="#10B981" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.callButtonText}>Ligar (Proxy)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <MapPin color="#6B7280" size={16} />
            <Text style={styles.addressLabel}>Endereço do Local</Text>
          </View>
          <Text style={styles.addressText}>{orderData.address}</Text>
          <Text style={styles.addressSubtext}>Bairro {orderData.neighborhood}</Text>

          {/* Botões de Rota Externa */}
          <View style={styles.routeButtonsRow}>
            <TouchableOpacity
              style={styles.wazeButton}
              onPress={handleOpenWaze}
              activeOpacity={0.8}
            >
              <Navigation color="#0891b2" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.wazeButtonText}>Waze</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapsButton}
              onPress={handleOpenGoogleMaps}
              activeOpacity={0.8}
            >
              <MapPin color="#2563eb" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.mapsButtonText}>Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.payoutContainer}>
          <Text style={styles.payoutLabel}>Ganhos Previstos (Líquido)</Text>
          <Text style={styles.payoutValue}>R$ {orderData.payoutAmount.toFixed(2)}</Text>
        </View>

        {/* Botão de Solicitar Adicional durante execução */}
        {jobStatus === 'IN_PROGRESS' && (
          <TouchableOpacity
            style={styles.additionalButton}
            onPress={() => navigation.navigate('AdditionalRequest', { orderId })}
            activeOpacity={0.7}
          >
            <PlusCircle color="#064e3b" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.additionalButtonText}>Solicitar Adicional (Materiais/Extra)</Text>
          </TouchableOpacity>
        )}

        {/* Badge de Sincronização Offline */}
        {hasPendingOfflineSync && (
          <View style={styles.offlineSyncBadge}>
            <WifiOff color="#d97706" size={14} style={{ marginRight: 6 }} />
            <Text style={styles.offlineSyncBadgeText}>
              Ação gravada offline no celular • Sincronizando com sinal 4G
            </Text>
          </View>
        )}

        {/* Botão de Ação Principal com Trava de Foto */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            jobStatus === 'IN_PROGRESS' && styles.finishButton,
            isLoading && styles.disabledButton,
          ]}
          onPress={jobStatus === 'ACCEPTED' ? handleStartFlow : handleCompleteFlow}
          disabled={isLoading || jobStatus === 'DONE'}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {jobStatus === 'ACCEPTED' ? (
                <View style={styles.buttonContent}>
                  <Camera color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Foto "Antes" & Iniciar Atendimento</Text>
                </View>
              ) : jobStatus === 'IN_PROGRESS' ? (
                <View style={styles.buttonContent}>
                  <CheckCircle2 color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Foto "Depois" & Finalizar Serviço</Text>
                </View>
              ) : (
                <Text style={styles.actionButtonText}>Serviço Finalizado ✓</Text>
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
  cameraBanner: {
    backgroundColor: '#064e3b',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    alignItems: 'center',
  },
  cameraBannerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraBannerSubtitle: {
    color: '#a7f3d0',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#064e3b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapSubtext: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  serviceName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  callButtonText: {
    color: '#064e3b',
    fontWeight: 'bold',
    fontSize: 13,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  addressSubtext: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  routeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  wazeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    borderRadius: 10,
    paddingVertical: 8,
  },
  wazeButtonText: {
    color: '#0891b2',
    fontWeight: '700',
    fontSize: 12,
  },
  mapsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingVertical: 8,
  },
  mapsButtonText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  payoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  payoutLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  payoutValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  additionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  additionalButtonText: {
    color: '#064e3b',
    fontWeight: 'bold',
    fontSize: 13,
  },
  offlineSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  offlineSyncBadgeText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#064e3b',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

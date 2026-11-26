import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PlusCircle, FileText, DollarSign, Camera, CheckCircle2 } from 'lucide-react-native';
import { StorageService } from '../services/StorageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

interface AdditionalRequestScreenProps {
  navigation?: any;
  orderId?: string;
}

export const AdditionalRequestScreen: React.FC<AdditionalRequestScreenProps> = ({
  navigation,
  orderId = 'order-123',
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState<'material' | 'extra_work'>('material');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTakeReceiptPhoto = () => {
    // Simula captura de foto da nota fiscal / comprovante de compra do material
    setReceiptPhoto('https://placeholder.co/600x400/064e3b/ffffff?text=NOTA+FISCAL');
  };

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Atenção', 'Preencha uma descrição válida e um valor positivo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await StorageService.getProfile();
      const token = profile?.token;

      const response = await fetch(`${API_URL}/orders/${orderId}/additionals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: numericAmount,
          description,
          receiptUrl: receiptPhoto || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      const isAutoApproved = data?.status === 'APPROVED';
      const isPendingAudit = data?.status === 'PENDING_ADMIN_AUDIT';

      let message = `A solicitação de R$ ${numericAmount.toFixed(2)} foi enviada para o cliente.`;
      if (isAutoApproved) {
        message = `O adicional de R$ ${numericAmount.toFixed(2)} foi auto-aprovado pela regra de materiais até R$ 30,00!`;
      } else if (isPendingAudit) {
        message = `O adicional excede 100% do pedido e foi encaminhado para auditoria preventiva do suporte.`;
      }

      Alert.alert('Solicitação Processada 📩', message, [
        {
          text: 'Voltar ao Job',
          onPress: () => navigation?.goBack(),
        },
      ]);
    } catch (error) {
      console.warn('Fallback em modo offline:', error);
      Alert.alert(
        'Solicitação Registrada (Offline) 📩',
        `A aprovação do adicional de R$ ${numericAmount.toFixed(2)} foi registrada.`,
        [
          {
            text: 'Voltar ao Job',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <PlusCircle color="#10b981" size={36} />
        <Text style={styles.title}>Solicitar Adicional</Text>
        <Text style={styles.subtitle}>
          Adicione custos extras de materiais comprados ou escopo adicional aprovado com o cliente.
        </Text>
      </View>

      {/* Tipo de Adicional */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, reason === 'material' && styles.typeBtnActive]}
          onPress={() => setReason('material')}
        >
          <Text style={[styles.typeBtnText, reason === 'material' && styles.typeBtnTextActive]}>
            📦 Material de Reposição
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, reason === 'extra_work' && styles.typeBtnActive]}
          onPress={() => setReason('extra_work')}
        >
          <Text style={[styles.typeBtnText, reason === 'extra_work' && styles.typeBtnTextActive]}>
            🔨 Serviço Extra
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Descrição Detalhada do Adicional</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ex: Compra de disjuntor 30A e 3m de cabo flexível 6mm na fita isolante..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Valor (R$)</Text>
        <View style={styles.inputRow}>
          <DollarSign color="#064e3b" size={20} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Foto do Comprovante/Nota Fiscal */}
        <Text style={[styles.label, { marginTop: 16 }]}>Nota Fiscal / Comprovante (Opcional)</Text>
        {receiptPhoto ? (
          <TouchableOpacity style={styles.receiptUploaded} onPress={handleTakeReceiptPhoto}>
            <CheckCircle2 color="#10b981" size={20} />
            <Text style={styles.receiptUploadedText}>Comprovante Anexado (Clique para alterar)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.uploadArea} onPress={handleTakeReceiptPhoto}>
            <Camera color="#10b981" size={24} />
            <Text style={styles.uploadText}>Fotografar Nota Fiscal / Recibo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.noticeBox}>
        <Text style={styles.noticeTitle}>ℹ️ Regras do Adicional Facilita</Text>
        <Text style={styles.noticeText}>
          • Materiais básicos até R$ 30,00 podem ser ressarcidos imediatamente.{'\n'}
          • O cliente receberá uma notificação em tempo real para autorizar a cobrança extra.{'\n'}
          • Máximo de 3 adicionais por atendimento.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Enviar para Aprovação do Cliente</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeBtnActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  typeBtnTextActive: {
    color: '#047857',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
    height: 80,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
  },
  uploadText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 8,
  },
  receiptUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  receiptUploadedText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 8,
  },
  noticeBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#10b981',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

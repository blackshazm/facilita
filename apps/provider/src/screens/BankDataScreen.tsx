import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Building, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { StorageService } from '../services/StorageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

interface FormInputProps {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  maxLength?: number;
  flex?: number;
}

const FormInput: React.FC<FormInputProps> = ({ icon, placeholder, value, onChangeText, keyboardType = 'default', maxLength, flex }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value.length > 0;

  return (
    <View style={[
      styles.inputContainer,
      isFocused && styles.inputFocused,
      !isFocused && isFilled && styles.inputFilled,
      flex ? { flex } : {}
    ]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={placeholder}
      />
    </View>
  );
};

export const BankDataScreen = ({ navigation }: { navigation?: any }) => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [bankCode, setBankCode] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankBranchDigit, setBankBranchDigit] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountDigit, setBankAccountDigit] = useState('');
  const [bankAccountType, setBankAccountType] = useState<'CHECKING' | 'SAVINGS'>('CHECKING');
  
  const [bankDataUpdatedAt, setBankDataUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      const profile = await StorageService.getProfile();
      const token = profile?.token;
      if (token) {
        const response = await fetch(`${API_URL}/payments/bank-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.bankCode) setBankCode(data.bankCode);
          if (data.bankBranch) setBankBranch(data.bankBranch);
          if (data.bankBranchDigit) setBankBranchDigit(data.bankBranchDigit);
          if (data.bankAccount) setBankAccount(data.bankAccount);
          if (data.bankAccountDigit) setBankAccountDigit(data.bankAccountDigit);
          if (data.bankAccountType) setBankAccountType(data.bankAccountType);
          if (data.bankDataUpdatedAt) setBankDataUpdatedAt(new Date(data.bankDataUpdatedAt));
        }
      }
    } catch (error) {
      console.warn('Fallback ao carregar dados bancários:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bankCode || !bankBranch || !bankAccount || !bankAccountDigit) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const profile = await StorageService.getProfile();
      const token = profile?.token;

      if (token) {
        await fetch(`${API_URL}/payments/bank-data`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bankCode,
            bankBranch,
            bankBranchDigit,
            bankAccount,
            bankAccountDigit,
            bankAccountType,
          }),
        });
      }

      setSaveSuccess(true);
      setBankDataUpdatedAt(new Date());
      Alert.alert('Dados Salvos com Sucesso! 🏦', 'Sua conta bancária está vinculada e seus repasses automáticos Pix cairão nesta conta.');
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.warn('Erro ao salvar dados bancários:', error);
      Alert.alert('Erro', 'Falha ao salvar dados bancários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const hoursSinceUpdate = bankDataUpdatedAt ? (Date.now() - bankDataUpdatedAt.getTime()) / (1000 * 60 * 60) : 24;
  const isLocked = hoursSinceUpdate < 24;
  const hoursRemaining = Math.ceil(24 - hoursSinceUpdate);

  if (fetchLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Dados Bancários</Text>
            <Text style={styles.subtitle}>Configure onde receber seus pagamentos</Text>
          </View>

          <View style={styles.form}>
            
            <Text style={styles.sectionLabel}>SEÇÃO: Banco</Text>
            <FormInput
              icon={<Building color="#059669" size={20} />}
              placeholder="Código do Banco (ex: 341 - Itaú)"
              value={bankCode}
              onChangeText={setBankCode}
              keyboardType="numeric"
              maxLength={3}
            />

            <Text style={styles.sectionLabel}>SEÇÃO: Agência</Text>
            <View style={styles.row}>
              <FormInput
                placeholder="Agência (0001)"
                value={bankBranch}
                onChangeText={setBankBranch}
                keyboardType="numeric"
                maxLength={4}
                flex={2}
              />
              <View style={{ width: 8 }} />
              <FormInput
                placeholder="Dígito (opcional)"
                value={bankBranchDigit}
                onChangeText={setBankBranchDigit}
                keyboardType="numeric"
                maxLength={1}
                flex={1}
              />
            </View>

            <Text style={styles.sectionLabel}>SEÇÃO: Conta</Text>
            <View style={styles.row}>
              <FormInput
                placeholder="Número da Conta"
                value={bankAccount}
                onChangeText={setBankAccount}
                keyboardType="numeric"
                maxLength={10}
                flex={2}
              />
              <View style={{ width: 8 }} />
              <FormInput
                placeholder="Dígito"
                value={bankAccountDigit}
                onChangeText={setBankAccountDigit}
                keyboardType="numeric"
                maxLength={1}
                flex={1}
              />
            </View>

            <Text style={styles.sectionLabel}>SEÇÃO: Tipo de Conta</Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.typePill, bankAccountType === 'CHECKING' && styles.typePillSelected]}
                onPress={() => setBankAccountType('CHECKING')}
              >
                <Text style={[styles.typePillText, bankAccountType === 'CHECKING' && styles.typePillTextSelected]}>
                  Corrente {bankAccountType === 'CHECKING' ? '●' : '○'}
                </Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity 
                style={[styles.typePill, bankAccountType === 'SAVINGS' && styles.typePillSelected]}
                onPress={() => setBankAccountType('SAVINGS')}
              >
                <Text style={[styles.typePillText, bankAccountType === 'SAVINGS' && styles.typePillTextSelected]}>
                  Poupança {bankAccountType === 'SAVINGS' ? '●' : '○'}
                </Text>
              </TouchableOpacity>
            </View>

            {isLocked && (
              <View style={styles.securityBadge} accessibilityRole="alert">
                <AlertTriangle color="#f59e0b" size={20} style={{ marginRight: 12, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.securityBadgeTitle}>⚠️ Saque bloqueado por segurança</Text>
                  <Text style={styles.securityBadgeText}>
                    Seus dados foram alterados. O próximo saque será processado em {hoursRemaining}h.
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={loading}
              accessibilityState={{ disabled: loading, busy: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : saveSuccess ? (
                <>
                  <Text style={styles.buttonText}>Salvo!</Text>
                  <CheckCircle color="#fff" size={20} />
                </>
              ) : (
                <>
                  <Text style={styles.buttonText}>Salvar Dados Bancários</Text>
                  <ArrowRight color="#fff" size={20} />
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
  content: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    flexGrow: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a7f3d0',
  },
  form: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 56,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#059669',
    borderWidth: 2,
  },
  inputFilled: {
    borderColor: '#059669',
    borderWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  typePill: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#059669',
    marginBottom: 16,
  },
  typePillSelected: {
    backgroundColor: '#059669',
  },
  typePillText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
  typePillTextSelected: {
    color: '#fff',
  },
  securityBadge: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  securityBadgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  securityBadgeText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#059669',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

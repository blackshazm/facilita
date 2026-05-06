import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { User, Phone, ArrowRight, Camera, CheckCircle } from 'lucide-react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'https://api.facilita.com.br'; // URL base fictícia

export const RegisterScreen = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 State
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  // Step 2 State (KYC)
  const [selfie, setSelfie] = useState(null);
  const [docFront, setDocFront] = useState(null);
  const [docBack, setDocBack] = useState(null);

  const captureImage = async (type: 'selfie' | 'document_front' | 'document_back') => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Erro', 'Precisamos de acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      // V2 Hardening: Compressão client-side antes do upload
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      if (type === 'selfie') setSelfie(compressed.uri);
      if (type === 'document_front') setDocFront(compressed.uri);
      if (type === 'document_back') setDocBack(compressed.uri);
    }
  };

  const uploadToS3 = async (uri: string, type: string) => {
    try {
      // 1. Get Presigned URL
      const { data } = await axios.post(`${API_URL}/identity/kyc/upload-url`, {
        type,
        mimeType: 'image/jpeg',
      });

      // 2. Upload Binary (Direct PUT)
      const response = await fetch(uri);
      const blob = await response.blob();

      await axios.put(data.url, blob, {
        headers: { 'Content-Type': 'image/jpeg' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Uploading ${type}: ${percentCompleted}%`);
        }
      });

      return data.key;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFinalize = async () => {
    if (!selfie || !docFront) {
      Alert.alert('Erro', 'Por favor, capture a selfie e a frente do documento.');
      return;
    }

    setLoading(true);
    try {
      const selfieKey = await uploadToS3(selfie, 'selfie');
      const docFrontKey = await uploadToS3(docFront, 'document_front');
      const docBackKey = docBack ? await uploadToS3(docBack, 'document_back') : undefined;

      await axios.post(`${API_URL}/identity/kyc/submit`, {
        selfieKey,
        documentFrontKey,
        documentBackKey,
      });

      setStep(3); // Success Step
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <View style={[styles.container, styles.center]}>
        <CheckCircle color="#fff" size={80} />
        <Text style={styles.successTitle}>Tudo pronto!</Text>
        <Text style={styles.successText}>Seu cadastro está em análise. Avisaremos quando for aprovado.</Text>
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
          <View style={styles.header}>
            <Text style={styles.title}>Passo {step} de 2</Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Informações básicas' : 'Verificação de Identidade (KYC)'}
            </Text>
          </View>

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <User color="#059669" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome Completo"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Phone color="#059669" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone (WhatsApp)"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                <Text style={styles.buttonText}>Próximo Passo</Text>
                <ArrowRight color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <KycButton 
                label="Tirar uma Selfie" 
                captured={!!selfie} 
                onPress={() => captureImage('selfie')} 
              />
              <KycButton 
                label="Frente do Documento" 
                captured={!!docFront} 
                onPress={() => captureImage('document_front')} 
              />
              <KycButton 
                label="Verso do Documento (Opcional)" 
                captured={!!docBack} 
                onPress={() => captureImage('document_back')} 
              />

              <TouchableOpacity 
                style={[styles.button, (!selfie || !docFront) && styles.buttonDisabled]} 
                onPress={handleFinalize}
                disabled={loading || !selfie || !docFront}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Finalizar Cadastro</Text>
                    <ArrowRight color="#fff" size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const KycButton = ({ label, captured, onPress }) => (
  <TouchableOpacity style={[styles.kycButton, captured && styles.kycButtonSuccess]} onPress={onPress}>
    <View style={styles.kycRow}>
      <Camera color={captured ? '#059669' : '#64748b'} size={24} />
      <Text style={[styles.kycLabel, captured && styles.kycLabelSuccess]}>{label}</Text>
    </View>
    {captured && <CheckCircle color="#059669" size={20} />}
  </TouchableOpacity>
);

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
    justifyContent: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
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
  kycButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 12,
  },
  kycButtonSuccess: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  kycRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#475569',
  },
  kycLabelSuccess: {
    color: '#059669',
    fontWeight: '600',
  },
  successTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  successText: {
    color: '#a7f3d0',
    textAlign: 'center',
    fontSize: 16,
  }
});

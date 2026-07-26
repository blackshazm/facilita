import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Camera, Upload, CheckCircle2, ShieldCheck, FileText } from 'lucide-react-native';

interface DocumentUploadScreenProps {
  onComplete?: () => void;
  navigation?: any;
}

export const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({
  onComplete,
  navigation,
}) => {
  const [docType, setDocType] = useState<'RG' | 'CNH'>('CNH');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [docFrontUri, setDocFrontUri] = useState<string | null>(null);
  const [docBackUri, setDocBackUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = (type: 'selfie' | 'front' | 'back') => {
    // Simula captura de foto via câmera ou galeria para onboarding
    const mockImage = `https://placeholder.co/600x400/064e3b/ffffff?text=${type.toUpperCase()}`;
    if (type === 'selfie') setSelfieUri(mockImage);
    if (type === 'front') setDocFrontUri(mockImage);
    if (type === 'back') setDocBackUri(mockImage);
  };

  const handleSubmit = async () => {
    if (!selfieUri || !docFrontUri) {
      Alert.alert('Atenção', 'Por favor, tire a selfie e a foto da frente do documento.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Envia para endpoint /identity/kyc/verify-provider
      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert(
          'Documentos Enviados! 🛡️',
          'Sua verificação de antecedentes e biometria facial foi iniciada. Em breve você receberá a aprovação!',
          [
            {
              text: 'Avançar',
              onPress: () => {
                if (onComplete) onComplete();
                else if (navigation) navigation.navigate('Categories');
              },
            },
          ]
        );
      }, 1500);
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert('Erro', 'Falha ao enviar documentos. Tente novamente.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ShieldCheck color="#10b981" size={40} />
        <Text style={styles.title}>Verificação de Identidade</Text>
        <Text style={styles.subtitle}>
          Precisamos de fotos nítidas do seu documento e de uma selfie para garantir a segurança da plataforma.
        </Text>
      </View>

      {/* Seleção do Tipo de Documento */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, docType === 'CNH' && styles.typeButtonActive]}
          onPress={() => setDocType('CNH')}
        >
          <FileText color={docType === 'CNH' ? '#064e3b' : '#9ca3af'} size={20} />
          <Text style={[styles.typeText, docType === 'CNH' && styles.typeTextActive]}>
            CNH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, docType === 'RG' && styles.typeButtonActive]}
          onPress={() => setDocType('RG')}
        >
          <FileText color={docType === 'RG' ? '#064e3b' : '#9ca3af'} size={20} />
          <Text style={[styles.typeText, docType === 'RG' && styles.typeTextActive]}>
            RG
          </Text>
        </TouchableOpacity>
      </View>

      {/* Seção 1: Selfie */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Sua Selfie (Rosto)</Text>
        <Text style={styles.cardDesc}>Tire em local bem iluminado, sem óculos ou boné.</Text>
        {selfieUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selfieUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.reTakeBtn} onPress={() => handlePickImage('selfie')}>
              <Text style={styles.reTakeText}>Refazer Selfie</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadArea} onPress={() => handlePickImage('selfie')}>
            <Camera color="#10b981" size={32} />
            <Text style={styles.uploadText}>Tirar Selfie Agora</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Seção 2: Frente do Documento */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Frente da {docType}</Text>
        <Text style={styles.cardDesc}>Foto nítida com todos os dados visíveis.</Text>
        {docFrontUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: docFrontUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.reTakeBtn} onPress={() => handlePickImage('front')}>
              <Text style={styles.reTakeText}>Refazer Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadArea} onPress={() => handlePickImage('front')}>
            <Upload color="#10b981" size={32} />
            <Text style={styles.uploadText}>Enviar Frente do Documento</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Seção 3: Verso do Documento (opcional) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. Verso da {docType} (Opcional)</Text>
        {docBackUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: docBackUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.reTakeBtn} onPress={() => handlePickImage('back')}>
              <Text style={styles.reTakeText}>Refazer Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadArea} onPress={() => handlePickImage('back')}>
            <Upload color="#9ca3af" size={32} />
            <Text style={styles.uploadTextAlt}>Enviar Verso do Documento</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <CheckCircle2 color="#ffffff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Enviar para Verificação</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#042f2e',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#10b981',
  },
  typeText: {
    color: '#9ca3af',
    fontWeight: '600',
    marginLeft: 6,
  },
  typeTextActive: {
    color: '#064e3b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadText: {
    color: '#10b981',
    fontWeight: '600',
    marginTop: 8,
  },
  uploadTextAlt: {
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 8,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  reTakeBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  reTakeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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

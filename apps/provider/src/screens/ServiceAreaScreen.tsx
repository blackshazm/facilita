import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MapPin, Navigation, CheckCircle2, Sliders } from 'lucide-react-native';

interface ServiceAreaScreenProps {
  onComplete?: () => void;
  navigation?: any;
}

export const ServiceAreaScreen: React.FC<ServiceAreaScreenProps> = ({
  onComplete,
  navigation,
}) => {
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [dailyJobLimit, setDailyJobLimit] = useState<number>(3);

  const RADIUS_OPTIONS = [3, 5, 8, 12, 15];

  const handleFinishOnboarding = () => {
    Alert.alert(
      'Cadastro Concluído! 🎉',
      `Sua região foi definida para ${radiusKm}km ao seu redor. Bem-vindo ao Facilita!`,
      [
        {
          text: 'Ir para o Dashboard',
          onPress: () => {
            if (onComplete) onComplete();
            else if (navigation) navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MapPin color="#10b981" size={40} />
        <Text style={styles.title}>Região de Atendimento</Text>
        <Text style={styles.subtitle}>
          Defina o raio máximo em quilômetros que você deseja se deslocar para atender chamados.
        </Text>
      </View>

      {/* Raio em KM */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Navigation color="#064e3b" size={20} />
          <Text style={styles.cardTitle}>Raio Máximo ({radiusKm} km)</Text>
        </View>

        <Text style={styles.cardDesc}>
          Recomendamos 5 km no início para otimizar o tempo de deslocamento.
        </Text>

        <View style={styles.optionsRow}>
          {RADIUS_OPTIONS.map((km) => (
            <TouchableOpacity
              key={km}
              style={[styles.radiusBtn, radiusKm === km && styles.radiusBtnActive]}
              onPress={() => setRadiusKm(km)}
            >
              <Text style={[styles.radiusText, radiusKm === km && styles.radiusTextActive]}>
                {km} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Limite diário de jobs */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Sliders color="#064e3b" size={20} />
          <Text style={styles.cardTitle}>Meta Diária de Atendimentos</Text>
        </View>
        <Text style={styles.cardDesc}>
          Tier 1 (Bronze): Limite recomendado de até 3 pedidos por dia.
        </Text>

        <View style={styles.optionsRow}>
          {[1, 2, 3, 5].map((limit) => (
            <TouchableOpacity
              key={limit}
              style={[styles.radiusBtn, dailyJobLimit === limit && styles.radiusBtnActive]}
              onPress={() => setDailyJobLimit(limit)}
            >
              <Text style={[styles.radiusText, dailyJobLimit === limit && styles.radiusTextActive]}>
                {limit} {limit === 1 ? 'job' : 'jobs'}/dia
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleFinishOnboarding}>
        <CheckCircle2 color="#ffffff" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.submitButtonText}>Finalizar Configuração</Text>
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
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  radiusBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  radiusText: {
    color: '#374151',
    fontWeight: '600',
  },
  radiusTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

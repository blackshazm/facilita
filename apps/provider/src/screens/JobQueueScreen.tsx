import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MapPin, Clock, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react-native';

interface JobOpportunity {
  id: string;
  category: string;
  title: string;
  address: string;
  distanceKm: number;
  price: number;
  urgency: 'normal' | 'urgent';
  createdAt: string;
}

const MOCK_JOBS: JobOpportunity[] = [
  {
    id: 'job-1',
    category: 'Eletricista',
    title: 'Instalação de 4 Tomadas de 20A na Cozinha',
    address: 'Rua Augusta, Consolação • SP',
    distanceKm: 1.8,
    price: 140.0,
    urgency: 'urgent',
    createdAt: 'Há 5 minutos',
  },
  {
    id: 'job-2',
    category: 'Encanador',
    title: 'Troca de Sifão e Reparo de Vazamento sob a Pia',
    address: 'Av. Rebouças, Pinheiros • SP',
    distanceKm: 3.2,
    price: 110.0,
    urgency: 'normal',
    createdAt: 'Há 12 minutos',
  },
  {
    id: 'job-3',
    category: 'Pequenos Reparos',
    title: 'Fixação de Suporte de TV 55" em Parede de Alvenaria',
    address: 'Rua Oscar Freire, Jardins • SP',
    distanceKm: 2.5,
    price: 95.0,
    urgency: 'normal',
    createdAt: 'Há 25 minutos',
  },
];

interface JobQueueScreenProps {
  navigation?: any;
}

export const JobQueueScreen: React.FC<JobQueueScreenProps> = ({ navigation }) => {
  const [jobs, setJobs] = useState<JobOpportunity[]>(MOCK_JOBS);

  const handleAcceptJob = (job: JobOpportunity) => {
    Alert.alert(
      'Aceitar Chamado?',
      `Confirmar aceite do serviço "${job.title}" por R$ ${job.price.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar Agora',
          onPress: () => {
            setJobs((prev) => prev.filter((j) => j.id !== job.id));
            if (navigation) navigation.navigate('ActiveJob');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fila de Oportunidades</Text>
        <Text style={styles.subtitle}>
          {jobs.length} {jobs.length === 1 ? 'chamado disponível' : 'chamados disponíveis'} no seu raio de atuação
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle2 color="#10b981" size={48} />
            <Text style={styles.emptyTitle}>Nenhum chamado no momento</Text>
            <Text style={styles.emptyDesc}>
              Você será notificado assim que um novo pedido surgirem no seu raio de atendimento.
            </Text>
          </View>
        ) : (
          jobs.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                </View>
                {item.urgency === 'urgent' && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>⚡ URGENTE</Text>
                  </View>
                )}
              </View>

              <Text style={styles.jobTitle}>{item.title}</Text>

              <View style={styles.infoRow}>
                <MapPin color="#6b7280" size={14} />
                <Text style={styles.infoText}>
                  {item.address} • <Text style={styles.boldText}>{item.distanceKm} km</Text>
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Clock color="#6b7280" size={14} />
                <Text style={styles.infoText}>{item.createdAt}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>Valor líquido a receber</Text>
                  <Text style={styles.priceValue}>R$ {item.price.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptJob(item)}
                >
                  <Text style={styles.acceptButtonText}>Aceitar</Text>
                  <ArrowRight color="#ffffff" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#064e3b',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#a7f3d0',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#ecfdf5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  categoryText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: 'bold',
  },
  urgentBadge: {
    backgroundColor: '#fef2f2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  urgentText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: 'bold',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  acceptButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
  },
});

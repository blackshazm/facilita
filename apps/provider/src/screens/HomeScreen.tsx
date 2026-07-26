import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Power, Wallet, Star, Clock, MapPin, Briefcase, ChevronRight, ShieldAlert } from 'lucide-react-native';

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header com Status Online/Offline */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, Carlos 👋</Text>
          <Text style={styles.tierBadge}>BRONZE • Tier 1</Text>
        </View>

        <View style={styles.statusToggle}>
          <Text style={[styles.statusLabel, isOnline ? styles.onlineText : styles.offlineText]}>
            {isOnline ? 'DISPONÍVEL' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#374151', true: '#10b981' }}
            thumbColor={isOnline ? '#ffffff' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Card de Carteira & Saldo */}
      <View style={styles.walletCard}>
        <View style={styles.walletRow}>
          <View>
            <Text style={styles.walletLabel}>Saldo Disponível</Text>
            <Text style={styles.walletValue}>R$ 480,00</Text>
          </View>
          <TouchableOpacity
            style={styles.walletBtn}
            onPress={() => navigation?.navigate('Wallet')}
          >
            <Wallet color="#ffffff" size={18} />
            <Text style={styles.walletBtnText}>Ver Carteira</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.walletFooter}>
          <Text style={styles.pendingText}>Pendente: R$ 150,00 (Liberação D+2)</Text>
        </View>
      </View>

      {/* Métricas Rápidas */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Star color="#f59e0b" size={20} />
          <Text style={styles.metricValue}>4.9</Text>
          <Text style={styles.metricLabel}>Nota (90 dias)</Text>
        </View>

        <View style={styles.metricCard}>
          <Briefcase color="#10b981" size={20} />
          <Text style={styles.metricValue}>12</Text>
          <Text style={styles.metricLabel}>Jobs Concluídos</Text>
        </View>

        <View style={styles.metricCard}>
          <Clock color="#6366f1" size={20} />
          <Text style={styles.metricValue}>2/3</Text>
          <Text style={styles.metricLabel}>Limite Hoje</Text>
        </View>
      </View>

      {/* Job Ativo ou Oportunidades */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chamados & Oportunidades</Text>
        <TouchableOpacity onPress={() => navigation?.navigate('JobQueue')}>
          <Text style={styles.seeAllText}>Ver Fila (3)</Text>
        </TouchableOpacity>
      </View>

      {/* Banner de Alerta de Novo Job */}
      <TouchableOpacity
        style={styles.activeJobCard}
        onPress={() => navigation?.navigate('ActiveJob')}
      >
        <View style={styles.jobTag}>
          <Text style={styles.jobTagText}>EM ANDAMENTO</Text>
        </View>
        <Text style={styles.jobTitle}>Troca de Chuveiro Elétrico (Lorenzetti)</Text>
        <View style={styles.jobInfoRow}>
          <MapPin color="#6b7280" size={14} />
          <Text style={styles.jobInfoText}>Pinheiros • 2,4 km de você</Text>
        </View>
        <View style={styles.jobPriceRow}>
          <Text style={styles.jobPriceLabel}>Valor a receber:</Text>
          <Text style={styles.jobPriceValue}>R$ 90,00</Text>
        </View>
      </TouchableOpacity>

      {/* Ações Rápidas */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Gerenciamento</Text>
      <View style={styles.menuList}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation?.navigate('Availability')}
        >
          <Clock color="#064e3b" size={20} />
          <Text style={styles.menuItemText}>Horários de Atendimento</Text>
          <ChevronRight color="#9ca3af" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation?.navigate('Performance')}
        >
          <Star color="#064e3b" size={20} />
          <Text style={styles.menuItemText}>Meu Score e Reputação</Text>
          <ChevronRight color="#9ca3af" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation?.navigate('DocumentUpload')}
        >
          <ShieldAlert color="#064e3b" size={20} />
          <Text style={styles.menuItemText}>Verificação de Documentos (KYC)</Text>
          <ChevronRight color="#9ca3af" size={18} />
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  statusToggle: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  onlineText: {
    color: '#10b981',
  },
  offlineText: {
    color: '#6b7280',
  },
  walletCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: '#a7f3d0',
    fontSize: 12,
  },
  walletValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  walletBtn: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  walletBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
  },
  walletFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#042f2e',
    paddingTop: 8,
  },
  pendingText: {
    color: '#a7f3d0',
    fontSize: 11,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  activeJobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  jobTag: {
    backgroundColor: '#d1fae5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  jobTagText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: 'bold',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  jobInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  jobInfoText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  jobPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  jobPriceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  menuList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 12,
  },
});

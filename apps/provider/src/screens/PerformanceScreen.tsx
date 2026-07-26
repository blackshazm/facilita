import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { Star, Award, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

interface PerformanceScreenProps {
  navigation?: any;
}

export const PerformanceScreen: React.FC<PerformanceScreenProps> = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner de Tier Atual */}
      <View style={styles.tierBanner}>
        <Award color="#f59e0b" size={40} />
        <Text style={styles.tierTitle}>Prestador BRONZE (Tier 1)</Text>
        <Text style={styles.tierSub}>
          Sua pontuação atual nos últimos 90 dias é <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>82 / 100</Text>.
        </Text>
      </View>

      {/* Critérios do Score */}
      <Text style={styles.sectionTitle}>Composição do Seu Score</Text>
      <View style={styles.card}>
        <View style={styles.scoreRow}>
          <Star color="#f59e0b" size={20} />
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreName}>Avaliação Média dos Clientes</Text>
            <Text style={styles.scoreSub}>Pontualidade, limpeza e solução técnica</Text>
          </View>
          <Text style={styles.scoreVal}>4.9 ⭐</Text>
        </View>

        <View style={styles.scoreRow}>
          <TrendingUp color="#10b981" size={20} />
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreName}>Taxa de Aceite de Chamados</Text>
            <Text style={styles.scoreSub}>Chamados aceitos no seu raio</Text>
          </View>
          <Text style={styles.scoreVal}>92%</Text>
        </View>

        <View style={styles.scoreRow}>
          <ShieldCheck color="#6366f1" size={20} />
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreName}>Índice de Conclusão sem Disputas</Text>
            <Text style={styles.scoreSub}>Serviços finalizados sem reclamações</Text>
          </View>
          <Text style={styles.scoreVal}>100%</Text>
        </View>
      </View>

      {/* Regras dos Tiers */}
      <Text style={styles.sectionTitle}>Níveis de Prestador (Tiers)</Text>
      <View style={styles.tierList}>
        <View style={[styles.tierItem, styles.tierActive]}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierName}>🥉 BRONZE (Nível 1) — Seu Nível</Text>
            <Text style={styles.tierLimit}>Até 3 jobs/dia</Text>
          </View>
          <Text style={styles.tierDesc}>Repasse em D+2. Indicado para início na plataforma.</Text>
        </View>

        <View style={styles.tierItem}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierNameAlt}>🥈 PRATA (Nível 2)</Text>
            <Text style={styles.tierLimitAlt}>Até 10 jobs/dia</Text>
          </View>
          <Text style={styles.tierDescAlt}>
            Requisitos: Score ≥ 85 + 20 atendimentos concluídos. Repasse prioritário.
          </Text>
        </View>

        <View style={styles.tierItem}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierNameAlt}>🥇 OURO (Nível 3)</Text>
            <Text style={styles.tierLimitAlt}>Sem limite de jobs</Text>
          </View>
          <Text style={styles.tierDescAlt}>
            Requisitos: Score ≥ 95 + MEI Verificado. Prioridade máxima na distribuição de chamados.
          </Text>
        </View>
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
  tierBanner: {
    backgroundColor: '#064e3b',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  tierSub: {
    fontSize: 13,
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scoreInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scoreName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scoreSub: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  scoreVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  tierList: {
    gap: 12,
  },
  tierItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tierActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tierName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  tierLimit: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
  },
  tierDesc: {
    fontSize: 12,
    color: '#047857',
  },
  tierNameAlt: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  tierLimitAlt: {
    fontSize: 12,
    color: '#6b7280',
  },
  tierDescAlt: {
    fontSize: 12,
    color: '#6b7280',
  },
});

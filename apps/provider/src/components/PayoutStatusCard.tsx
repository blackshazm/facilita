import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';

export type PayoutStatus = 'PROCESSING' | 'PAID' | 'FAILED' | 'PENDING_APPROVAL';

interface PayoutStatusCardProps {
  amount: number;
  status: PayoutStatus;
  timestamp: string;
  availableBalance: number;
}

export const PayoutStatusCard: React.FC<PayoutStatusCardProps> = ({ amount, status, timestamp, availableBalance }) => {
  const formatCurrency = (val: number) => {
    return (val / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'PROCESSING':
        return { color: '#f59e0b', label: 'Em processamento', icon: <Clock color="#f59e0b" size={16} /> };
      case 'PAID':
        return { color: '#059669', label: 'Transferido ✓', icon: <CheckCircle2 color="#059669" size={16} /> };
      case 'FAILED':
        return { color: '#ef4444', label: 'Falhou — estorno realizado', icon: <XCircle color="#ef4444" size={16} /> };
      case 'PENDING_APPROVAL':
        return { color: '#6366f1', label: 'Aguardando aprovação', icon: <AlertCircle color="#6366f1" size={16} /> };
      default:
        return { color: '#94a3b8', label: 'Desconhecido', icon: <Clock color="#94a3b8" size={16} /> };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>Último Payout</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
        <View style={styles.timeBadge}>
          {config.icon}
          <Text style={styles.timeText}>há {timestamp}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.balanceLabel}>Saldo Disponível</Text>
        <Text style={styles.balanceValue}>{formatCurrency(availableBalance)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#475569',
  },
  balanceValue: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
  },
});

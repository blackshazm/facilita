import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, Building2, Award } from 'lucide-react-native';
import { StorageService } from '../services/StorageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'PAYOUT';
  description: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'CREDIT',
    description: 'Instalação de Chuveiro - Pedido #1024',
    amount: 102.0,
    date: 'Hoje, 14:30',
    status: 'PENDING',
  },
  {
    id: 'tx-2',
    type: 'CREDIT',
    description: 'Troca de Disjuntor - Pedido #1019',
    amount: 128.0,
    date: 'Ontem, 16:15',
    status: 'PAID',
  },
  {
    id: 'tx-3',
    type: 'PAYOUT',
    description: 'Transferência Pix Pagar.me (Conta Principal)',
    amount: -350.0,
    date: '10/11/2026',
    status: 'PAID',
  },
  {
    id: 'tx-4',
    type: 'CREDIT',
    description: 'Reparo Hidráulico - Pedido #1008',
    amount: 112.0,
    date: '08/11/2026',
    status: 'PAID',
  },
];

interface WalletScreenProps {
  navigation?: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const [balance, setBalance] = useState<number>(480.0);
  const [pendingBalance, setPendingBalance] = useState<number>(102.0);
  const [tier, setTier] = useState<'BRONZE' | 'PRATA' | 'OURO'>('PRATA');
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const profile = await StorageService.getProfile();
      if (profile?.tier) {
        setTier(profile.tier);
      }
      const token = profile?.token;

      const res = await fetch(`${API_URL}/payments/wallet`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.availableBalance !== undefined) setBalance(Number(data.availableBalance));
        if (data.pendingBalance !== undefined) setPendingBalance(Number(data.pendingBalance));
        if (data.tier) setTier(data.tier);
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      }
    } catch (err) {
      console.warn('Fallback em modo offline para carteira:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const getPayoutDelayText = () => {
    if (tier === 'OURO') return 'D+1 (1 dia corrido) • Taxa reduzida 18%';
    if (tier === 'PRATA') return 'D+2 (2 dias corridos) • Taxa 20%';
    return 'D+3 (3 dias corridos) • Taxa 20%';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Balanço Principal */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Wallet color="#a7f3d0" size={24} />
          <Text style={styles.balanceHeaderTitle}>Sua Carteira Facilita</Text>
          <View style={styles.tierBadge}>
            <Award color="#fef08a" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.tierBadgeText}>{tier}</Text>
          </View>
        </View>

        <Text style={styles.balanceLabel}>Saldo Líquido Disponível</Text>
        <Text style={styles.balanceValue}>R$ {balance.toFixed(2)}</Text>

        <View style={styles.pendingBox}>
          <Clock color="#fef08a" size={16} />
          <Text style={styles.pendingText}>
            Pendente de Liberação: <Text style={{ fontWeight: 'bold' }}>R$ {pendingBalance.toFixed(2)}</Text> ({tier === 'OURO' ? 'D+1' : tier === 'PRATA' ? 'D+2' : 'D+3'})
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bankDataBtn}
          onPress={() => navigation?.navigate('BankData')}
          activeOpacity={0.7}
        >
          <Building2 color="#064e3b" size={16} />
          <Text style={styles.bankDataBtnText}>Dados Bancários Cadastrados</Text>
        </TouchableOpacity>
      </View>

      {/* Regra de Repasse Pagar.me v4.1 */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🛡️ Regras de Repasse Facilita v4.1</Text>
        <Text style={styles.infoText}>
          Seu nível atual é <Text style={{ fontWeight: 'bold', color: '#064e3b' }}>{tier}</Text>.
          {'\n'}Seus repasses são processados via Pix em <Text style={{ fontWeight: 'bold' }}>{getPayoutDelayText()}</Text>.
          {'\n\n'}
          • <Text style={{ fontWeight: 'bold' }}>Bronze:</Text> Repasse em D+3 (após avaliação do cliente).
          {'\n'}• <Text style={{ fontWeight: 'bold' }}>Prata:</Text> Repasse acelerado em D+2.
          {'\n'}• <Text style={{ fontWeight: 'bold' }}>Ouro:</Text> Repasse prioritário em D+1 com comissão reduzida para 18%.
        </Text>
      </View>

      {/* Extrato de Transações */}
      <Text style={styles.sectionTitle}>Histórico de Transações</Text>
      <View style={styles.txList}>
        {transactions.map((tx) => {
          const isCredit = tx.amount > 0;

          return (
            <View key={tx.id} style={styles.txItem}>
              <View style={[styles.txIcon, isCredit ? styles.iconCredit : styles.iconDebit]}>
                {isCredit ? (
                  <ArrowDownRight color="#059669" size={20} />
                ) : (
                  <ArrowUpRight color="#dc2626" size={20} />
                )}
              </View>

              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>

              <View style={styles.txAmountContainer}>
                <Text style={[styles.txAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
                  {isCredit ? `+R$ ${tx.amount.toFixed(2)}` : `-R$ ${Math.abs(tx.amount).toFixed(2)}`}
                </Text>
                <Text style={[styles.txStatus, tx.status === 'PAID' ? styles.statusPaid : styles.statusPending]}>
                  {tx.status === 'PAID' ? 'LIBERADO' : 'AGENDADO'}
                </Text>
              </View>
            </View>
          );
        })}
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
  balanceCard: {
    backgroundColor: '#064e3b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeaderTitle: {
    color: '#a7f3d0',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierBadgeText: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceLabel: {
    color: '#d1fae5',
    fontSize: 13,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 4,
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  pendingText: {
    color: '#fef08a',
    fontSize: 12,
    marginLeft: 6,
  },
  bankDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a7f3d0',
    paddingVertical: 12,
    borderRadius: 12,
  },
  bankDataBtnText: {
    color: '#064e3b',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  txList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCredit: {
    backgroundColor: '#d1fae5',
  },
  iconDebit: {
    backgroundColor: '#fee2e2',
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  txDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  amountCredit: {
    color: '#059669',
  },
  amountDebit: {
    color: '#dc2626',
  },
  txStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusPaid: {
    color: '#059669',
  },
  statusPending: {
    color: '#d97706',
  },
});

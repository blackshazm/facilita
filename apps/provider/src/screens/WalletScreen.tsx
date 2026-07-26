import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, Building2, CheckCircle2 } from 'lucide-react-native';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'PAYOUT';
  description: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'CREDIT',
    description: 'Instalação Elétrica - Pedido #1024',
    amount: 140.0,
    date: 'Hoje, 14:30',
    status: 'PENDING',
  },
  {
    id: 'tx-2',
    type: 'CREDIT',
    description: 'Troca de Chuveiro - Pedido #1019',
    amount: 90.0,
    date: 'Ontem, 16:15',
    status: 'PAID',
  },
  {
    id: 'tx-3',
    type: 'PAYOUT',
    description: 'Transferência Pix Pagar.me (Itaú)',
    amount: -350.0,
    date: '20/07/2026',
    status: 'PAID',
  },
  {
    id: 'tx-4',
    type: 'CREDIT',
    description: 'Reparo de Vazo - Pedido #1008',
    amount: 120.0,
    date: '19/07/2026',
    status: 'PAID',
  },
];

interface WalletScreenProps {
  navigation?: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Balanço Principal */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Wallet color="#a7f3d0" size={24} />
          <Text style={styles.balanceHeaderTitle}>Sua Carteira Facilita</Text>
        </View>

        <Text style={styles.balanceLabel}>Saldo Líquido Disponível</Text>
        <Text style={styles.balanceValue}>R$ 480,00</Text>

        <View style={styles.pendingBox}>
          <Clock color="#fef08a" size={16} />
          <Text style={styles.pendingText}>
            Pendente de Liberação: <Text style={{ fontWeight: 'bold' }}>R$ 140,00</Text> (D+2)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bankDataBtn}
          onPress={() => navigation?.navigate('BankData')}
        >
          <Building2 color="#064e3b" size={16} />
          <Text style={styles.bankDataBtnText}>Dados Bancários Cadastrados</Text>
        </TouchableOpacity>
      </View>

      {/* Regra de Repasse Pagar.me */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Como funcionam os seus pagamentos</Text>
        <Text style={styles.infoText}>
          Os repasses são processados via <Text style={{ fontWeight: 'bold' }}>Pagar.me Split</Text>.
          Os valores de serviços concluídos entram no seu saldo disponível em <Text style={{ fontWeight: 'bold' }}>D+2 úteis</Text> diretamente na sua conta corrente cadastrada.
        </Text>
      </View>

      {/* Extrato de Transações */}
      <Text style={styles.sectionTitle}>Histórico de Transações</Text>
      <View style={styles.txList}>
        {MOCK_TRANSACTIONS.map((tx) => {
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
                <Text style={styles.txStatus}>
                  {tx.status === 'PAID' ? 'CONCLUÍDO' : 'PENDENTE'}
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
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  balanceLabel: {
    color: '#a7f3d0',
    fontSize: 12,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 16,
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#042f2e',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  pendingText: {
    color: '#fef08a',
    fontSize: 12,
    marginLeft: 6,
  },
  bankDataBtn: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
  },
  bankDataBtnText: {
    color: '#064e3b',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  txList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
    fontWeight: 'bold',
    color: '#1f2937',
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
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
});

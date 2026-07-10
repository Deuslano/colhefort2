import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useMemo, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function CashFlow() {
  const navigation = useNavigation();
  const { cashFlowTransactions, accountsReceivable, addCashFlowTransaction, isDarkMode } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Entrada');

  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const cashFlowData = useMemo(() => {
    const transactions = cashFlowTransactions || [];
    const receivables = accountsReceivable || [];
    const incomes = transactions.filter(t => t.type === 'Entrada').reduce((sum, t) => sum + (t.amount || 0), 0);
    const outcomes = transactions.filter(t => t.type === 'Saída').reduce((sum, t) => sum + (t.amount || 0), 0);
    const pendingReceivable = receivables.filter(a => a.status === 'Pendente').reduce((sum, a) => sum + (a.amount || 0), 0);
    return {
      availableBalance: incomes - outcomes,
      incomes,
      outcomes,
      pendingReceivable,
    };
  }, [cashFlowTransactions, accountsReceivable]);

  const handleAddTransaction = async () => {
    if (!description.trim() || !date.trim() || !amount.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos da transação.');
      return;
    }
    await addCashFlowTransaction({ description: description.trim(), date: date.trim(), amount: parseFloat(amount), type });
    setShowModal(false);
    setDescription('');
    setDate('');
    setAmount('');
    Alert.alert('Sucesso', 'Transação adicionada.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fluxo de Caixa</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} onPress={() => setShowModal(true)}>
          <Icon name="add" size={22} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: currentTheme.primary }]}>
          <View style={[styles.balanceIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Icon name="wallet" size={28} color={theme.colors.secondary} />
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>R$ {cashFlowData.availableBalance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
          </View>
        </View>

        {/* Incomes and Outcomes */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.success + '20', borderWidth: 1 }]}>
            <View style={[styles.summaryIconContainer, { backgroundColor: currentTheme.success + '15' }]}>
              <Icon name="arrow-down" size={20} color={currentTheme.success} />
            </View>
            <Text style={[styles.summaryLabel, { color: currentTheme.textLight }]}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: currentTheme.success }]}>
              R$ {cashFlowData.incomes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.danger + '20', borderWidth: 1 }]}>
            <View style={[styles.summaryIconContainer, { backgroundColor: currentTheme.danger + '15' }]}>
              <Icon name="arrow-up" size={20} color={currentTheme.danger} />
            </View>
            <Text style={[styles.summaryLabel, { color: currentTheme.textLight }]}>Saídas</Text>
            <Text style={[styles.summaryValue, { color: currentTheme.danger }]}>
              R$ {cashFlowData.outcomes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </Text>
          </View>
        </View>

        {/* Pending Receivable */}
        <View style={[styles.pendingCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.primary + '20', borderWidth: 1 }]}>
          <View style={[styles.pendingIconContainer, { backgroundColor: currentTheme.primary + '15' }]}>
            <Icon name="time" size={20} color={currentTheme.primary} />
          </View>
          <View style={styles.pendingInfo}>
            <Text style={[styles.pendingLabel, { color: currentTheme.textLight }]}>A Receber (Pendente)</Text>
            <Text style={[styles.pendingValue, { color: currentTheme.primary }]}>R$ {cashFlowData.pendingReceivable.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Transações Recentes</Text>
          
          {/* Pending Accounts Receivable */}
          {accountsReceivable
            .filter(acc => acc.status === 'Pendente')
            .map((account) => (
              <View key={account.id} style={[styles.transactionItem, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}>
                <View style={[styles.transactionIcon, { backgroundColor: currentTheme.primary + '15' }]}>
                  <Icon name="time" size={18} color={currentTheme.primary} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionDescription, { color: currentTheme.text }]}>{account.description || account.clientName}</Text>
                  <Text style={[styles.transactionDate, { color: currentTheme.textLight }]}>{account.date}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: currentTheme.primary }]}>
                  R$ {account.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </Text>
              </View>
            ))}
          
          {/* Cash Flow Transactions */}
          {cashFlowTransactions.map((transaction) => (
            <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'Entrada' ? currentTheme.success + '15' : currentTheme.danger + '15' }]}>
                <Icon name={transaction.type === 'Entrada' ? 'arrow-down' : 'arrow-up'} size={18} color={transaction.type === 'Entrada' ? currentTheme.success : currentTheme.danger} />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDescription, { color: currentTheme.text }]}>{transaction.description}</Text>
                <Text style={[styles.transactionDate, { color: currentTheme.textLight }]}>{transaction.date}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: transaction.type === 'Entrada' ? currentTheme.success : currentTheme.danger }]}>
                {transaction.type === 'Entrada' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Nova transação</Text>
            <TextInput style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} placeholder="Descrição" placeholderTextColor={currentTheme.textLight} value={description} onChangeText={setDescription} />
            <TextInput style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} placeholder="Data" placeholderTextColor={currentTheme.textLight} value={date} onChangeText={setDate} />
            <TextInput style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} placeholder="Valor" placeholderTextColor={currentTheme.textLight} value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <View style={styles.typeSelector}>
              <TouchableOpacity style={[styles.typeOption, { borderColor: currentTheme.border, backgroundColor: type === 'Entrada' ? currentTheme.primary : currentTheme.background }]} onPress={() => setType('Entrada')}>
                <Text style={[styles.typeOptionText, { color: type === 'Entrada' ? '#fff' : currentTheme.text }]}>Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeOption, { borderColor: currentTheme.border, backgroundColor: type === 'Saída' ? currentTheme.danger : currentTheme.background }]} onPress={() => setType('Saída')}>
                <Text style={[styles.typeOptionText, { color: type === 'Saída' ? '#fff' : currentTheme.text }]}>Saída</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}><Text style={[styles.cancelText, { color: currentTheme.textLight }]}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: currentTheme.primary }]} onPress={handleAddTransaction}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    color: theme.colors.secondary + 'CC',
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  pendingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  pendingValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  typeOptionText: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  cancelText: {
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});

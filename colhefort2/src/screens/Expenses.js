import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { uploadToCloudinary } from '../utils/cloudinaryService';
import { maskDate, maskCurrency, currencyToNumber } from '../utils/masks';

export default function Expenses() {
  const navigation = useNavigation();
  const { expenses, addExpense, updateExpense } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pendente');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const tabs = ['Todas', 'Pago', 'Pendente'];
  const filteredExpenses = selectedTab === 'Todas' 
    ? (expenses || []).filter(e => !e.isSplit) 
    : (expenses || []).filter(e => e.status === selectedTab && !e.isSplit);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        setUploading(true);
        const url = await uploadToCloudinary(result.assets[0].uri, 'receipts');
        setReceiptUrl(url);
        setUploading(false);
        Alert.alert('Sucesso', 'Comprovante anexado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao anexar comprovante:', error);
      Alert.alert('Erro', 'Não foi possível anexar o comprovante.');
      setUploading(false);
    }
  };

  const calculateInstallments = (totalAmount, numInstallments, startDate, day) => {
    if (!totalAmount || !numInstallments || !startDate || !day) return '';
    
    const installmentAmount = (totalAmount / numInstallments).toFixed(2);
    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    
    const dates = [];
    for (let i = 0; i < numInstallments; i++) {
      const month = (startMonth + i) % 12 || 12;
      const year = startYear + Math.floor((startMonth + i - 1) / 12);
      dates.push(`${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`);
    }
    
    return dates.map((d, i) => `${i + 1}ª: ${d} (R$ ${installmentAmount})`).join(', ');
  };

  const handleInstallmentsChange = (text) => {
    setInstallments(text);
    if (text && date && paymentDay && amount) {
      const calculatedDates = calculateInstallments(parseFloat(amount), parseInt(text), date, parseInt(paymentDay));
      // Você pode mostrar isso em um campo separado se quiser
    }
  };

  const getStatusColor = (status) => {
    return status === 'Pago' ? theme.colors.success : theme.colors.danger;
  };

  const toggleStatus = async (expense) => {
    if (expense.status === 'Pendente') {
      setSelectedExpense(expense);
      setPaymentDate('');
      setShowPaymentModal(true);
    } else {
      await updateExpense({ ...expense, status: 'Pendente', paymentDate: '' });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paymentDate.trim()) {
      Alert.alert('Erro', 'Informe a data do pagamento.');
      return;
    }
    await updateExpense({ 
      ...selectedExpense, 
      status: 'Pago', 
      paymentDate: paymentDate.trim(),
      receiptUrl: receiptUrl 
    });
    setShowPaymentModal(false);
    setSelectedExpense(null);
    setPaymentDate('');
    setReceiptUrl('');
  };

  const handleAddExpense = async () => {
    if (!date.trim() || !description.trim() || !amount.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos da despesa.');
      return;
    }
    
    let paymentDates = '';
    if (paymentMethod === 'Parcelado' && installments && paymentDay) {
      paymentDates = calculateInstallments(currencyToNumber(amount), parseInt(installments), date, parseInt(paymentDay));
    }
    
    await addExpense({ 
      date: date.trim(), 
      description: description.trim(), 
      amount: currencyToNumber(amount), 
      status,
      paymentMethod,
      installments,
      paymentDay,
      paymentDates
    });
    setShowModal(false);
    setDate('');
    setDescription('');
    setAmount('');
    setPaymentMethod('');
    setInstallments('');
    setPaymentDay('');
    Alert.alert('Sucesso', 'Despesa adicionada.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Despesas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="add" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredExpenses.map((expense) => (
          <TouchableOpacity 
            key={expense.id} 
            style={styles.expenseCard}
            onPress={() => toggleStatus(expense)}
          >
            <View style={styles.expenseHeader}>
              <View style={styles.expenseDate}>
                <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                <Text style={styles.expenseDateText}>{expense.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                  {expense.status}
                </Text>
              </View>
            </View>
            
            <Text style={styles.expenseDescription}>{expense.description}</Text>
            
            <View style={styles.expenseFooter}>
              <Text style={styles.expenseAmount}>R$ {expense.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
              <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Nova despesa</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data</Text>
              <TextInput 
                style={styles.input} 
                placeholder="DD/MM/AAAA" 
                value={date} 
                onChangeText={(text) => setDate(maskDate(text))} 
                maxLength={10}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput style={styles.input} placeholder="Descrição da despesa" value={description} onChangeText={setDescription} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor</Text>
              <TextInput 
                style={styles.input} 
                placeholder="0,00" 
                value={amount} 
                onChangeText={(text) => setAmount(maskCurrency(text))} 
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Forma de Pagamento</Text>
              <View style={styles.statusSelector}>
                {['À vista', 'Parcelado'].map((pm) => (
                  <TouchableOpacity key={pm} style={[styles.statusOption, paymentMethod === pm && styles.selectedStatus]} onPress={() => setPaymentMethod(pm)}>
                    <Text style={[styles.statusOptionText, paymentMethod === pm && styles.selectedStatusText]}>{pm}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {paymentMethod === 'Parcelado' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Número de Parcelas</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ex: 12" 
                    value={installments} 
                    onChangeText={handleInstallmentsChange} 
                    keyboardType="numeric" 
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dia do Pagamento</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ex: 10 (dia 10 de cada mês)" 
                    value={paymentDay} 
                    onChangeText={setPaymentDay} 
                    keyboardType="numeric" 
                    maxLength={2}
                  />
                </View>

                {installments && paymentDay && date && amount && (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewLabel}>Prévia das Parcelas:</Text>
                    <Text style={styles.previewText}>{calculateInstallments(parseFloat(amount), parseInt(installments), date, parseInt(paymentDay))}</Text>
                  </View>
                )}
              </>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusSelector}>
                {['Pago', 'Pendente'].map((s) => (
                  <TouchableOpacity key={s} style={[styles.statusOption, status === s && styles.selectedStatus]} onPress={() => setStatus(s)}>
                    <Text style={[styles.statusOptionText, status === s && styles.selectedStatusText]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Data do Pagamento</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Data do pagamento (DD/MM/AAAA)" 
              value={paymentDate} 
              onChangeText={setPaymentDate} 
              maxLength={10}
            />
            
            <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument} disabled={uploading}>
              <Icon name="document-attach" size={20} color={theme.colors.secondary} />
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Enviando...' : receiptUrl ? 'Comprovante anexado ✓' : 'Anexar Comprovante (PDF)'}
              </Text>
            </TouchableOpacity>
            
            {receiptUrl && (
              <Text style={styles.receiptText}>Comprovante salvo com sucesso</Text>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setShowPaymentModal(false);
                setReceiptUrl('');
              }}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleMarkAsPaid}><Text style={styles.saveText}>Confirmar</Text></TouchableOpacity>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  expenseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseDateText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expenseDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalContentScroll: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: theme.colors.text,
  },
  statusSelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  selectedStatus: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusOptionText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedStatusText: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  cancelText: {
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  previewText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '20',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  uploadButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  receiptText: {
    fontSize: 12,
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: 8,
  },
});

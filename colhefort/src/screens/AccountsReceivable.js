import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { uploadToCloudinary } from '../utils/cloudinaryService';
import { maskDate, maskCurrency, currencyToNumber } from '../utils/masks';

export default function AccountsReceivable() {
  const navigation = useNavigation();
  const { accountsReceivable, addAccountReceivable, updateAccountReceivable } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pendente');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState('1');

  const tabs = ['Todas', 'Recebido', 'Pendente'];
  const filteredAccounts = selectedTab === 'Todas' ? (accountsReceivable || []) : (accountsReceivable || []).filter(a => a.status === selectedTab);

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

  const getStatusColor = (status) => {
    return status === 'Recebido' ? theme.colors.success : theme.colors.danger;
  };

  const toggleStatus = async (account) => {
    if (account.status === 'Pendente') {
      setSelectedAccount(account);
      setPaymentDate('');
      setShowPaymentModal(true);
    } else {
      await updateAccountReceivable({ ...account, status: 'Pendente', paymentDate: '' });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paymentDate.trim()) {
      Alert.alert('Erro', 'Informe a data do pagamento.');
      return;
    }
    await updateAccountReceivable({ 
      ...selectedAccount, 
      status: 'Recebido', 
      paymentDate: paymentDate.trim(),
      receiptUrl: receiptUrl 
    });
    setShowPaymentModal(false);
    setSelectedAccount(null);
    setPaymentDate('');
    setReceiptUrl('');
  };

  const handleAddAccount = async () => {
    if (!date.trim() || !description.trim() || !amount.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos da conta.');
      return;
    }

    const amountNum = currencyToNumber(amount);
    
    if (isInstallment && installments && parseInt(installments) > 1) {
      const installmentsNum = parseInt(installments);
      const installmentValue = amountNum / installmentsNum;
      const dateParts = date.split('/');
      const baseDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      
      for (let i = 1; i <= installmentsNum; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        
        const formattedDate = `${String(dueDate.getDate()).padStart(2, '0')}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${dueDate.getFullYear()}`;
        
        await addAccountReceivable({
          date: formattedDate,
          description: `${description} (Parc. ${i}/${installmentsNum})`,
          amount: installmentValue,
          status,
          installmentNumber: i,
          totalInstallments: installmentsNum,
        });
      }
      Alert.alert('Sucesso', `${installmentsNum} parcelas adicionadas.`);
    } else {
      await addAccountReceivable({ date: date.trim(), description: description.trim(), amount: amountNum, status });
      Alert.alert('Sucesso', 'Conta adicionada.');
    }
    
    setShowModal(false);
    setDate('');
    setDescription('');
    setAmount('');
    setIsInstallment(false);
    setInstallments('1');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contas a Receber</Text>
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
        {filteredAccounts.map((account) => (
          <TouchableOpacity 
            key={account.id} 
            style={styles.accountCard}
            onPress={() => toggleStatus(account)}
          >
            <View style={styles.accountHeader}>
              <View style={styles.accountDate}>
                <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                <Text style={styles.accountDateText}>{account.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(account.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(account.status) }]}>
                  {account.status}
                </Text>
              </View>
            </View>
            
            <Text style={styles.accountDescription}>{account.description}</Text>
            
            {account.installmentNumber && (
              <View style={styles.installmentInfo}>
                <Text style={styles.installmentBadge}>Parcela {account.installmentNumber} de {account.totalInstallments}</Text>
              </View>
            )}
            
            <View style={styles.accountFooter}>
              <Text style={styles.accountAmount}>R$ {account.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
              <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Nova conta a receber</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Data" 
                value={date} 
                onChangeText={(text) => setDate(maskDate(text))}
                maxLength={10}
              />
              <TextInput style={styles.input} placeholder="Descrição" value={description} onChangeText={setDescription} />
              <TextInput 
                style={styles.input} 
                placeholder="Valor Total" 
                value={amount} 
                onChangeText={(text) => setAmount(maskCurrency(text))}
                keyboardType="numeric"
              />
              
              <View style={styles.installmentToggleContainer}>
                <TouchableOpacity 
                  style={[styles.installmentToggle, !isInstallment && styles.installmentToggleActive]} 
                  onPress={() => setIsInstallment(false)}
                >
                  <Text style={[styles.installmentToggleText, !isInstallment && styles.installmentToggleTextActive]}>Pagamento Único</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.installmentToggle, isInstallment && styles.installmentToggleActive]} 
                  onPress={() => setIsInstallment(true)}
                >
                  <Text style={[styles.installmentToggleText, isInstallment && styles.installmentToggleTextActive]}>Parcelado</Text>
                </TouchableOpacity>
              </View>
              
              {isInstallment && (
                <View style={styles.installmentInputContainer}>
                  <Text style={styles.installmentLabel}>Número de Parcelas:</Text>
                  <TextInput
                    style={styles.installmentInput}
                    placeholder="Ex: 3"
                    keyboardType="numeric"
                    value={installments}
                    onChangeText={setInstallments}
                  />
                  {amount && installments && parseInt(installments) > 0 && (
                    <Text style={styles.installmentPreview}>
                      {installments}x de R$ {(currencyToNumber(amount) / parseInt(installments)).toFixed(2)}
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.statusSelector}>
                {['Recebido', 'Pendente'].map((s) => (
                  <TouchableOpacity key={s} style={[styles.statusOption, status === s && styles.selectedStatus]} onPress={() => setStatus(s)}>
                    <Text style={[styles.statusOptionText, status === s && styles.selectedStatusText]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddAccount}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
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
  accountCard: {
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
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountDateText: {
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
  accountDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
  },
  installmentInfo: {
    marginBottom: 8,
  },
  installmentBadge: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  accountAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.success,
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
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
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
  installmentToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8ECEF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
  },
  installmentToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  installmentToggleActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  installmentToggleText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textLight },
  installmentToggleTextActive: { color: theme.colors.primary },
  installmentInputContainer: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  installmentLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  installmentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: theme.colors.text,
    marginBottom: 8,
  },
  installmentPreview: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
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

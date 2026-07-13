import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView, Modal } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

export default function NewSale() {
  const { products, addSale, addInvoice, clients, draftSaleItems: selectedItems, setDraftSaleItems: setSelectedItems } = useContext(AppContext);
  const [selectedClient, setSelectedClient] = useState(null);
  const [date] = useState(new Date().toLocaleDateString('pt-BR'));
  const [receipt, setReceipt] = useState(null);
  
  const [paymentType, setPaymentType] = useState('avista');
  const [installments, setInstallments] = useState('1');
  const [fixedPaymentDay, setFixedPaymentDay] = useState('');
  
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  
  const navigation = useNavigation();

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const addProduct = (product) => {
    const exists = selectedItems.find(item => item.id === product.id);
    if (exists) {
      setSelectedItems(selectedItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    }
  };

  const removeProduct = (id) => {
    const item = selectedItems.find(p => p.id === id);
    if (item.quantity > 1) {
      setSelectedItems(selectedItems.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p
      ));
    } else {
      setSelectedItems(selectedItems.filter(p => p.id !== id));
    }
  };

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const pickReceipt = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (result.assets && result.assets.length > 0) {
        setReceipt(result.assets[0]);
      }
    } catch (err) {
      console.log('Error picking receipt', err);
    }
  };

  const finishSale = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto à venda.');
      return;
    }
    if (!selectedClient) {
      Alert.alert('Atenção', 'Selecione um cliente cadastrado antes de finalizar.');
      return;
    }

    const clientName = selectedClient.name;
    
    let installmentsNum = parseInt(installments, 10);
    if (paymentType === 'prazo' && (isNaN(installmentsNum) || installmentsNum < 1)) {
      Alert.alert('Erro', 'Informe um número válido de parcelas.');
      return;
    }

    const saleId = Date.now().toString();

    const sale = {
      id: saleId,
      client: clientName,
      clientId: selectedClient.id,
      date,
      items: selectedItems,
      total,
      receiptUri: receipt ? receipt.uri : null,
      paymentType,
      installments: paymentType === 'prazo' ? installmentsNum : 1,
    };

    addSale(sale);

    if (paymentType === 'prazo') {
      const installmentValue = total / installmentsNum;
      const now = new Date();
      
      if (fixedPaymentDay && parseInt(fixedPaymentDay) > 0 && parseInt(fixedPaymentDay) <= 31) {
        const paymentDay = parseInt(fixedPaymentDay);
        
        for (let i = 1; i <= installmentsNum; i++) {
          const dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          dueDate.setDate(Math.min(paymentDay, new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()));
          
          addInvoice({
            description: `Parc. ${i}/${installmentsNum} - ${clientName}`,
            value: installmentValue,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'pending',
            saleId: saleId,
            clientId: selectedClient.id,
          });
        }
        Alert.alert('Sucesso', `Venda finalizada! Foram geradas ${installmentsNum} faturas para dia ${paymentDay} de cada mês.`);
      } else {
        for (let i = 1; i <= installmentsNum; i++) {
          const dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          
          addInvoice({
            description: `Parc. ${i}/${installmentsNum} - ${clientName}`,
            value: installmentValue,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'pending',
            saleId: saleId,
            clientId: selectedClient.id,
          });
        }
        Alert.alert('Sucesso', `Venda finalizada! Foram geradas ${installmentsNum} faturas para ${clientName}.`);
      }
    } else {
      Alert.alert('Sucesso', 'Venda à vista finalizada!');
    }

    setSelectedItems([]);
    setSelectedClient(null);
    setReceipt(null);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Venda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          
          {/* Client Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cliente *</Text>
            <TouchableOpacity style={styles.clientPicker} onPress={() => setShowClientPicker(true)}>
              {selectedClient ? (
                <View style={styles.selectedClientRow}>
                  <View style={styles.miniAvatar}>
                    <Text style={styles.miniAvatarText}>{selectedClient.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedClient(null)}>
                    <Icon name="close-circle" size={20} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.clientPickerPlaceholder}>
                  <Icon name="person-add-outline" size={20} color={theme.colors.textLight} />
                  <Text style={styles.clientPickerText}>Toque para selecionar um cliente</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Receipt */}
          <View style={styles.inputGroup}>
            <TouchableOpacity style={styles.receiptButton} onPress={pickReceipt}>
              <Icon name={receipt ? "checkmark-circle" : "document-attach-outline"} size={20} color={receipt ? theme.colors.success : theme.colors.primary} />
              <Text style={[styles.receiptText, { color: receipt ? theme.colors.success : theme.colors.primary }]}>
                {receipt ? `Comprovante: ${receipt.name}` : 'Anexar Comprovante (Img/PDF)'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Forma de Pagamento</Text>
            <View style={styles.paymentToggleContainer}>
              <TouchableOpacity 
                style={[styles.paymentToggle, paymentType === 'avista' && styles.paymentToggleActive]} 
                onPress={() => setPaymentType('avista')}
              >
                <Text style={[styles.paymentToggleText, paymentType === 'avista' && styles.paymentToggleTextActive]}>À Vista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.paymentToggle, paymentType === 'prazo' && styles.paymentToggleActive]} 
                onPress={() => setPaymentType('prazo')}
              >
                <Text style={[styles.paymentToggleText, paymentType === 'prazo' && styles.paymentToggleTextActive]}>A Prazo / Cartão</Text>
              </TouchableOpacity>
            </View>
          </View>

          {paymentType === 'prazo' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Parcelas (Meses)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 2"
                  keyboardType="numeric"
                  value={installments}
                  onChangeText={setInstallments}
                  placeholderTextColor="#999"
                />
              </View>
              
              <Text style={[styles.label, { marginTop: 12 }]}>Dia de Pagamento (fixo) - Opcional</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 10 (todo dia 10)"
                  keyboardType="numeric"
                  value={fixedPaymentDay}
                  onChangeText={setFixedPaymentDay}
                  maxLength={2}
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.hintText}>Se informado, todas as parcelas vencerão neste dia do mês. Ex: dia 10 = 10/01, 10/02, 10/03...</Text>
              <Text style={styles.hintText}>O sistema gerará faturas para controle de recebimento (Fiado ou Cartão).</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <View style={styles.dateContainer}>
              <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>

        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selecione os Produtos</Text>
          <View style={styles.productListWrapper}>
            {products.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>
            ) : (
              products.map(item => (
                <TouchableOpacity key={item.id} style={styles.productRow} onPress={() => addProduct(item)}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.addButton}>
                    <Icon name="add" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {selectedItems.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Carrinho</Text>
            {selectedItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemQty}>Qtd: {item.quantity}</Text>
                </View>
                <Text style={styles.cartItemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeProduct(item.id)} style={styles.cartRemoveBtn}>
                  <Icon name="remove-circle" size={24} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <View>
            <Text style={styles.totalLabel}>Total da Venda</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
            {paymentType === 'prazo' && total > 0 && (
              <Text style={styles.installmentText}>
                {installments}x de R$ {(total / (parseInt(installments, 10) || 1)).toFixed(2)}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={finishSale}>
          <Icon name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.finishButtonText}>Finalizar Venda</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Selecionar Cliente */}
      <Modal visible={showClientPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Cliente</Text>
              <TouchableOpacity onPress={() => { setShowClientPicker(false); setClientSearch(''); }}>
                <Icon name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalSearchContainer}>
              <Icon name="search" size={18} color={theme.colors.textLight} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar pelo nome..."
                value={clientSearch}
                onChangeText={setClientSearch}
                autoFocus
              />
            </View>

            {filteredClients.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Icon name="people-outline" size={40} color={theme.colors.border} />
                <Text style={styles.modalEmptyText}>
                  {clients.length === 0 ? 'Nenhum cliente cadastrado.\nCadastre um na aba "Clientes".' : 'Nenhum resultado encontrado.'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredClients}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.clientOption} 
                    onPress={() => { setSelectedClient(item); setShowClientPicker(false); setClientSearch(''); }}
                  >
                    <View style={styles.clientOptionAvatar}>
                      <Text style={styles.clientOptionAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clientOptionName}>{item.name}</Text>
                      {item.phone ? <Text style={styles.clientOptionPhone}>{item.phone}</Text> : null}
                    </View>
                    <Icon name="chevron-forward" size={18} color={theme.colors.textLight} />
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 300 }}
              />
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 180 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: theme.colors.text, marginBottom: 8, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 48, fontSize: 16, color: theme.colors.text },
  // Client Picker
  clientPicker: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  clientPickerPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientPickerText: {
    fontSize: 15,
    color: '#999',
    marginLeft: 10,
  },
  selectedClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  selectedClientName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  // Receipt
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  receiptText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
  // Payment Toggle
  paymentToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8ECEF',
    borderRadius: 10,
    padding: 4,
  },
  paymentToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  paymentToggleActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paymentToggleText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textLight },
  paymentToggleTextActive: { color: theme.colors.primary },
  hintText: { fontSize: 12, color: theme.colors.textLight, marginTop: 6, fontStyle: 'italic' },
  // Date
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  dateText: { fontSize: 16, color: theme.colors.textLight },
  // Products
  productListWrapper: { maxHeight: 300 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  productPrice: { fontSize: 14, color: theme.colors.primary, marginTop: 4, fontWeight: 'bold' },
  addButton: {
    backgroundColor: theme.colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontStyle: 'italic',
    padding: 20,
  },
  // Cart
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  cartItemQty: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
  cartItemPrice: { fontSize: 15, fontWeight: 'bold', color: theme.colors.primary, marginRight: 10 },
  cartRemoveBtn: { padding: 4 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: { fontSize: 16, color: theme.colors.textLight },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  installmentText: { fontSize: 13, color: theme.colors.secondary, fontWeight: 'bold', marginTop: 2 },
  finishButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  finishButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // Client Picker Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalSearchInput: { flex: 1, height: 44, fontSize: 15, marginLeft: 8 },
  modalEmpty: { alignItems: 'center', paddingVertical: 30 },
  modalEmptyText: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', marginTop: 10 },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientOptionAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clientOptionAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  clientOptionName: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  clientOptionPhone: { fontSize: 12, color: theme.colors.textLight, marginTop: 2 },
});
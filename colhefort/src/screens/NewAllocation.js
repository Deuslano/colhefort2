import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useMemo, useState } from 'react';
import { FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useAlert } from '../components/CustomAlert';
import { maskDate, maskCurrency, currencyToNumber } from '../utils/masks';

const pickerLabels = {
  machine: 'Máquina',
  client: 'Cliente',
  paymentMethod: 'Forma de Pagamento',
};

export default function NewAllocation() {
  const navigation = useNavigation();
  const { machines, clients, addAllocation, updateMachine } = useContext(AppContext);
  const { showAlert } = useAlert();

  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [selectedMachineName, setSelectedMachineName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientName, setSelectedClientName] = useState('');
  const [operator, setOperator] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actualStartDate, setActualStartDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [rentalValue, setRentalValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [paymentDates, setPaymentDates] = useState('');

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
    if (text && startDate && paymentDay && rentalValue) {
      const calculatedDates = calculateInstallments(currencyToNumber(rentalValue), parseInt(text), startDate, parseInt(paymentDay));
      setPaymentDates(calculatedDates);
    }
  };

  const handlePaymentDayChange = (text) => {
    setPaymentDay(text);
    if (text && startDate && installments && rentalValue) {
      const calculatedDates = calculateInstallments(currencyToNumber(rentalValue), parseInt(installments), startDate, parseInt(text));
      setPaymentDates(calculatedDates);
    }
  };
  const [observations, setObservations] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState('');

  const machineItems = useMemo(() => [...machines].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [machines]);
  const clientItems = useMemo(() => [...clients].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [clients]);

  // Máscara para data (DD/MM/AAAA)
  const handleDateChange = (text, setter) => {
    let formatted = text.replace(/\D/g, '');
    if (formatted.length > 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
    }
    if (formatted.length > 5) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
    }
    setter(formatted);
  };

  // Máscara para valor monetário (R$ 0,00)
  const handleValueChange = (text) => {
    let formatted = text.replace(/\D/g, '');
    if (formatted === '') {
      setRentalValue('');
      return;
    }
    // Remove limite de valor - permite qualquer valor
    const value = parseInt(formatted, 10) / 100;
    setRentalValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const openPicker = (type) => {
    setPickerType(type);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerType('');
  };

  const selectItem = (item) => {
    if (pickerType === 'machine') {
      setSelectedMachineId(item.id);
      setSelectedMachineName(item.name);
      if (!operator.trim() && item.operator) {
        setOperator(item.operator);
      }
    } else if (pickerType === 'client') {
      setSelectedClientId(item.id || item.userId);
      setSelectedClientName(item.name + (item.farmName ? ` - ${item.farmName}` : ''));
    } else if (pickerType === 'paymentMethod') {
      setPaymentMethod(item);
    }
    closePicker();
  };

  const handleSave = async () => {
    if (!selectedMachineId || !selectedClientId || !startDate || !endDate || !serviceType.trim() || !rentalValue.trim()) {
      showAlert('Erro', 'Selecione máquina, cliente, período, tipo de serviço e valor do aluguel.');
      return;
    }

    const normalizedValue = Number(String(rentalValue).replace(/\./g, '').replace(',', '.'));
    
    if (Number.isNaN(normalizedValue) || normalizedValue <= 0) {
      showAlert('Erro', 'Informe um valor de aluguel válido.');
      return;
    }

    try {
      await addAllocation({
        machineId: selectedMachineId,
        machineName: selectedMachineName,
        clientId: selectedClientId,
        clientName: selectedClientName,
        operator: operator.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        serviceType: serviceType.trim(),
        rentalValue: Number(normalizedValue.toFixed(2)),
        paymentMethod: paymentMethod.trim(),
        installments: installments.trim(),
        paymentDates: paymentDates.trim(),
        observations: observations.trim(),
        status: 'Pendentes', // Status inicial é Pendentes
        actualStartDate: actualStartDate.trim(),
        actualEndDate: actualEndDate.trim(),
        createdAt: new Date().toISOString(),
      });

      showAlert('Sucesso', 'Alocação salva com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar alocação:', error);
      showAlert('Erro', `Não foi possível salvar a alocação: ${error.message}`);
    }
  };

  const pickerItems = () => {
    if (pickerType === 'machine') return machineItems;
    if (pickerType === 'client') return clientItems;
    if (pickerType === 'paymentMethod') return ['À vista', 'Parcelado'];
    return [];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Alocação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informações da Máquina</Text>

          <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('machine')}>
            <Icon name="leaf" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <Text style={[styles.input, !selectedMachineName && styles.placeholder]}>
              {selectedMachineName || 'Selecione a máquina'}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Operador"
              placeholderTextColor={theme.colors.textLight}
              value={operator}
              onChangeText={setOperator}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Cliente / Fazenda</Text>

          <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('client')}>
            <Icon name="business-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <Text style={[styles.input, !selectedClientName && styles.placeholder]}>
              {selectedClientName || 'Selecione o cliente'}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Período</Text>

          <View style={styles.inputContainer}>
            <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Data de início (DD/MM/AAAA)"
              placeholderTextColor={theme.colors.textLight}
              value={startDate}
              onChangeText={(text) => setStartDate(maskDate(text))}
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Data de término (DD/MM/AAAA)"
              placeholderTextColor={theme.colors.textLight}
              value={endDate}
              onChangeText={(text) => setEndDate(maskDate(text))}
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Status Real (Opcional)</Text>

          <View style={styles.inputContainer}>
            <Icon name="log-in-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Data de chegada no cliente (DD/MM/AAAA)"
              placeholderTextColor={theme.colors.textLight}
              value={actualStartDate}
              onChangeText={(text) => setActualStartDate(maskDate(text))}
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="log-out-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Data de volta (DD/MM/AAAA)"
              placeholderTextColor={theme.colors.textLight}
              value={actualEndDate}
              onChangeText={(text) => setActualEndDate(maskDate(text))}
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Serviço</Text>

          <View style={styles.inputContainer}>
            <Icon name="construct-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tipo de serviço"
              placeholderTextColor={theme.colors.textLight}
              value={serviceType}
              onChangeText={setServiceType}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="cash-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={theme.colors.textLight}
              value={rentalValue}
              onChangeText={(text) => setRentalValue(maskCurrency(text))}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('paymentMethod')}>
            <Icon name="card-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <Text style={[styles.input, !paymentMethod && styles.placeholder]}>
              {paymentMethod || 'Selecione forma de pagamento'}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>

          {paymentMethod === 'Parcelado' && (
            <>
              <View style={styles.inputContainer}>
                <Icon name="grid-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Número de parcelas (ex: 12)"
                  placeholderTextColor={theme.colors.textLight}
                  value={installments}
                  onChangeText={handleInstallmentsChange}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Dia do pagamento (ex: 10)"
                  placeholderTextColor={theme.colors.textLight}
                  value={paymentDay}
                  onChangeText={handlePaymentDayChange}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              {installments && paymentDay && startDate && rentalValue && (
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Prévia das Parcelas:</Text>
                  <Text style={styles.previewText}>{paymentDates}</Text>
                </View>
              )}
            </>
          )}

          <View style={styles.textAreaContainer}>
            <Icon name="document-text-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações (opcional)"
              placeholderTextColor={theme.colors.textLight}
              value={observations}
              onChangeText={setObservations}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Salvar Alocação</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>{pickerLabels[pickerType] || 'Selecione'}</Text>
            <FlatList
              data={pickerItems()}
              keyExtractor={(item, index) => item.id || item.name || item || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerItem} onPress={() => selectItem(item)}>
                  <Text style={styles.pickerItemText}>{item.name || item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.pickerCancel} onPress={closePicker}>
              <Text style={styles.pickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.textLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  pickerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerCancel: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

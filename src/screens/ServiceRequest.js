import React, { useContext, useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, Modal, FlatList, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const pickerLabels = {
  machine: 'Máquina',
  service: 'Tipo de Serviço',
};

export default function ServiceRequest() {
  const navigation = useNavigation();
  const route = useRoute();
  const { machines, currentUser, addAllocation, clients } = useContext(AppContext);
  
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [selectedMachineName, setSelectedMachineName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [observations, setObservations] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState('');
  const [loading, setLoading] = useState(false);

  // Pré-selecionar máquina se vier da tela de detalhes
  useEffect(() => {
    if (route.params?.machine) {
      setSelectedMachineId(route.params.machine.id);
      setSelectedMachineName(route.params.machine.name);
    }
  }, [route.params]);

  const serviceTypes = [
    'Colheita',
    'Plantio',
    'Pulverização',
    'Aragem',
    'Transporte',
    'Outro',
  ];

  const availableMachines = useMemo(() => 
    machines.filter(m => m.status === 'Disponível' || m.status === 'Agendado').sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [machines]
  );

  const openPicker = (type) => {
    setPickerType(type);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerType('');
  };

  const selectMachine = (machine) => {
    setSelectedMachineId(machine.id);
    setSelectedMachineName(machine.name);
    closePicker();
  };

  const selectService = (service) => {
    setServiceType(service);
    closePicker();
  };

  const handleSubmit = async () => {
    if (!selectedMachineId || !serviceType) {
      Alert.alert('Erro', 'Selecione a máquina e o tipo de serviço.');
      return;
    }

    setLoading(true);
    try {
      await addAllocation({
        machineId: selectedMachineId,
        machineName: selectedMachineName,
        clientId: currentUser?.uid || '',
        clientName: currentUser?.displayName || currentUser?.email || 'Produtor',
        operator: '',
        startDate: startDate.trim() || '',
        endDate: endDate.trim() || '',
        serviceType: serviceType,
        rentalValue: 0,
        observations: observations.trim(),
        status: 'Pendente',
        approvalStatus: 'pending',
        requestedBy: currentUser?.uid,
        requestedAt: new Date().toISOString(),
        actualStartDate: '',
        actualEndDate: '',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Sucesso', 'Solicitação enviada! Aguarde aprovação do administrador.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a solicitação.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickerItems = () => {
    if (pickerType === 'machine') return availableMachines;
    if (pickerType === 'service') return serviceTypes;
    return [];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar Serviço</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Selecione a máquina e o tipo de serviço desejado. Após enviar, o administrador analisará sua solicitação e fornecerá um orçamento.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Máquina Desejada</Text>
          <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('machine')}>
            <Icon name="leaf" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <Text style={[styles.input, !selectedMachineName && styles.placeholder]}>
              {selectedMachineName || 'Selecione a máquina'}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Tipo de Serviço</Text>
          <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('service')}>
            <Icon name="construct-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <Text style={[styles.input, !serviceType && styles.placeholder]}>
              {serviceType || 'Selecione o tipo de serviço'}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Período Desejado</Text>
          <View style={styles.inputContainer}>
            <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Data de início (DD/MM/AAAA)"
              placeholderTextColor={theme.colors.textLight}
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Data de término (DD/MM/AAAA)"
              placeholderTextColor={theme.colors.textLight}
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <View style={styles.textAreaContainer}>
            <Icon name="document-text-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalhes adicionais sobre o serviço (opcional)"
              placeholderTextColor={theme.colors.textLight}
              value={observations}
              onChangeText={setObservations}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <Text style={styles.submitButtonText}>Enviando...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>{pickerLabels[pickerType] || 'Selecione'}</Text>
            <FlatList
              data={pickerItems()}
              keyExtractor={(item, index) => item.id || item.name || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.pickerItem} 
                  onPress={() => pickerType === 'machine' ? selectMachine(item) : selectService(item)}
                >
                  {pickerType === 'machine' && item.image ? (
                    <Image source={{ uri: item.image }} style={styles.machineImage} />
                  ) : null}
                  <View style={styles.pickerItemContent}>
                    <Text style={styles.pickerItemText}>{item.name || item}</Text>
                    {pickerType === 'machine' && item.status ? (
                      <Text style={styles.machineStatus}>{item.status}</Text>
                    ) : null}
                  </View>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
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
  placeholder: {
    color: theme.colors.textLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  machineImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  pickerItemContent: {
    flex: 1,
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  machineStatus: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
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

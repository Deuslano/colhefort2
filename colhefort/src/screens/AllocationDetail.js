import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function AllocationDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { machines, clients, updateAllocation, deleteAllocation, updateMachine, serviceOrders, updateServiceOrder } = useContext(AppContext);
  const allocation = route.params?.allocation;
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(allocation?.status || 'Em andamento');
  const [actualStartDate, setActualStartDate] = useState(allocation?.actualStartDate || '');
  const [actualEndDate, setActualEndDate] = useState(allocation?.actualEndDate || '');

  const machine = machines.find((item) => item.id === allocation?.machineId);
  const client = clients.find((item) => item.id === allocation?.clientId);

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `R$ ${number.toFixed(2).replace('.', ',')}`;
  };

  const handleSave = async () => {
    try {
      const updatedAllocation = {
        ...allocation,
        status,
        actualStartDate: actualStartDate.trim(),
        actualEndDate: actualEndDate.trim(),
      };
      await updateAllocation(updatedAllocation);

      // Update machine status based on allocation status
      if (machine) {
        const machineStatus = status === 'Concluídas' ? 'Disponível' : status;
        await updateMachine({
          ...machine,
          status: machineStatus,
        });
      }

      Alert.alert('Sucesso', 'Alocação atualizada.');
      setEditing(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a alocação.');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta alocação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllocation(allocation.id);
              // Update machine status to available
              if (machine) {
                await updateMachine({
                  ...machine,
                  status: 'Disponível',
                  clientId: '',
                  clientName: '',
                });
              }
              Alert.alert('Sucesso', 'Alocação excluída.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a alocação.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'Em andamento' && !actualStartDate) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setActualStartDate(formattedDate);
    }
    if (newStatus === 'Concluídas' && !actualEndDate) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setActualEndDate(formattedDate);
    }
    setStatus(newStatus);
  };

  const handleStartService = async () => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setActualStartDate(formattedDate);
    setStatus('Em andamento');
    
    try {
      await updateAllocation({
        ...allocation,
        status: 'Em andamento',
        actualStartDate: formattedDate,
      });

      // Update corresponding service order
      const serviceOrder = serviceOrders.find(so => so.allocationId === allocation.id);
      if (serviceOrder) {
        await updateServiceOrder({
          ...serviceOrder,
          status: 'Em andamento',
          actualStartDate: formattedDate,
        });
      }

      if (machine) {
        await updateMachine({
          ...machine,
          status: 'Em andamento',
          clientId: allocation.clientId,
          clientName: allocation.clientName,
        });
      }

      Alert.alert('Sucesso', 'Serviço iniciado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o serviço.');
      console.error(error);
    }
  };

  const handleFinishService = async () => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setActualEndDate(formattedDate);
    setStatus('Concluídas');
    
    try {
      await updateAllocation({
        ...allocation,
        status: 'Concluídas',
        actualEndDate: formattedDate,
      });

      // Update corresponding service order
      const serviceOrder = serviceOrders.find(so => so.allocationId === allocation.id);
      if (serviceOrder) {
        await updateServiceOrder({
          ...serviceOrder,
          status: 'Concluídas',
          actualEndDate: formattedDate,
        });
      }

      if (machine) {
        await updateMachine({
          ...machine,
          status: 'Disponível',
          clientId: '',
          clientName: '',
        });
      }

      Alert.alert('Sucesso', 'Serviço concluído!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível concluir o serviço.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Detalhe da Alocação</Text>
        </View>
        <View style={styles.headerActions}>
          {allocation?.status === 'Pendentes' && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Icon name="trash-outline" size={24} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing((prev) => !prev)}>
            <Text style={styles.editButtonText}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(allocation?.status) }]}>
          <Icon name={getStatusIcon(allocation?.status)} size={32} color="#fff" />
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Status</Text>
            {editing ? (
              <View style={styles.statusSelector}>
                {['Agendadas', 'Em andamento', 'Concluídas'].map((s) => (
                  <TouchableOpacity key={s} style={[styles.statusOption, status === s && styles.selectedStatus]} onPress={() => handleStatusChange(s)}>
                    <Text style={[styles.statusOptionText, status === s && styles.selectedStatusText]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.statusText}>{allocation?.status || 'Em andamento'}</Text>
            )}
          </View>
        </View>

        {/* Machine Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Máquina</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="construct" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Máquina</Text>
                <Text style={styles.infoValue}>{allocation?.machineName || machine?.name || '-'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="person" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Operador</Text>
                <Text style={styles.infoValue}>{allocation?.operator || 'Não informado'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="build" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Serviço</Text>
                <Text style={styles.infoValue}>{allocation?.serviceType || 'Não informado'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Cliente</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="business" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cliente</Text>
                <Text style={styles.infoValue}>{allocation?.clientName || client?.name || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Period Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Período</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Planejado</Text>
                <Text style={styles.infoValue}>{allocation?.startDate || '-'} até {allocation?.endDate || '-'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="time" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Início Real</Text>
                {editing ? (
                  <TextInput style={styles.input} value={actualStartDate} onChangeText={setActualStartDate} placeholder="DD/MM/AAAA HH:MM" />
                ) : (
                  <Text style={styles.infoValue}>{actualStartDate || '-'}</Text>
                )}
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="checkmark-circle" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Finalização Real</Text>
                {editing ? (
                  <TextInput style={styles.input} value={actualEndDate} onChangeText={setActualEndDate} placeholder="DD/MM/AAAA HH:MM" />
                ) : (
                  <Text style={styles.infoValue}>{actualEndDate || '-'}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Financial Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Financeiras</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="cash" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Valor do Aluguel</Text>
                <Text style={[styles.infoValue, styles.highlightValue]}>{formatCurrency(allocation?.rentalValue)}</Text>
              </View>
            </View>
            {allocation?.paymentMethod ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="card" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Forma de Pagamento</Text>
                  <Text style={styles.infoValue}>{allocation.paymentMethod}</Text>
                </View>
              </View>
            ) : null}
            {allocation?.installments ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="layers" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Parcelas</Text>
                  <Text style={styles.infoValue}>{allocation.installments}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Observations */}
        {allocation?.observations ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="document-text" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoValue}>{allocation.observations}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}
        
        {!editing && (
          <View style={styles.actionButtons}>
            {allocation?.status === 'Pendentes' && (
              <TouchableOpacity style={styles.startButton} onPress={handleStartService}>
                <Icon name="play-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Iniciar Serviço</Text>
              </TouchableOpacity>
            )}
            {allocation?.status === 'Em andamento' && (
              <TouchableOpacity style={styles.finishButton} onPress={handleFinishService}>
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Concluir Serviço</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {editing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Agendadas': return '#FFA726';
    case 'Em andamento': return '#2E7D32';
    case 'Concluídas': return '#1976D2';
    case 'Pendentes': return '#757575';
    default: return '#2E7D32';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Agendadas': return 'calendar-outline';
    case 'Em andamento': return 'play-circle-outline';
    case 'Concluídas': return 'checkmark-circle-outline';
    case 'Pendentes': return 'time-outline';
    default: return 'help-circle-outline';
  }
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: theme.colors.primary },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  editButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff' },
  editButtonText: { color: theme.colors.primary, fontWeight: '600', fontSize: 14 },
  content: { flex: 1, padding: 20 },
  
  // Status Card
  statusCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statusInfo: { marginLeft: 16, flex: 1 },
  statusLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  statusText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  
  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12, marginLeft: 4 },
  
  // Info Cards
  infoCard: { backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${theme.colors.primary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, color: theme.colors.textLight, marginBottom: 2 },
  infoValue: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  highlightValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  
  // Status Selector
  statusSelector: { flexDirection: 'row', marginTop: 8 },
  statusOption: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', marginRight: 8 },
  selectedStatus: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.5)' },
  statusOptionText: { color: '#fff', fontWeight: '500', fontSize: 12 },
  selectedStatusText: { color: '#fff', fontWeight: 'bold' },
  
  // Input
  input: { backgroundColor: '#F5F7FA', borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.colors.text, marginTop: 4 },
  
  // Buttons
  saveButton: { marginTop: 20, backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  actionButtons: { marginTop: 20 },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 12, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  finishButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.success, paddingVertical: 14, borderRadius: 12, shadowColor: theme.colors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

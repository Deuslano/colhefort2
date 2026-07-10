import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useMemo, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function ApprovalScreen() {
  const navigation = useNavigation();
  const { allocations, updateAllocation, updateMachine, userRole } = useContext(AppContext);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quoteValue, setQuoteValue] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Icon name="lock-closed" size={64} color={theme.colors.textLight} />
          <Text style={styles.message}>Acesso restrito</Text>
          <Text style={styles.subMessage}>Apenas administradores podem acessar esta tela.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pendingRequests = useMemo(() => 
    allocations.filter(a => a.approvalStatus === 'pending' || a.status === 'Pendente'),
    [allocations]
  );

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `R$ ${number.toFixed(2).replace('.', ',')}`;
  };

  const openApprovalModal = (allocation) => {
    setSelectedAllocation(allocation);
    setQuoteValue(allocation.rentalValue ? String(allocation.rentalValue) : '');
    setRejectionReason('');
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!quoteValue.trim()) {
      Alert.alert('Erro', 'Informe o valor do orçamento.');
      return;
    }

    const normalizedValue = Number(String(quoteValue).replace(/[R$\s.]/g, '').replace(',', '.'));
    if (Number.isNaN(normalizedValue) || normalizedValue <= 0) {
      Alert.alert('Erro', 'Informe um valor válido.');
      return;
    }

    setLoading(true);
    try {
      await updateAllocation({
        ...selectedAllocation,
        rentalValue: Number(normalizedValue.toFixed(2)),
        approvalStatus: 'approved',
        status: 'Agendadas',
        approvedBy: userRole,
        approvedAt: new Date().toISOString(),
      });

      // Update machine status to Agendado
      const machine = allocations.find(a => a.id === selectedAllocation.id)?.machineId;
      if (machine) {
        await updateMachine({
          id: selectedAllocation.machineId,
          status: 'Agendado',
          clientId: selectedAllocation.clientId,
          clientName: selectedAllocation.clientName,
        });
      }

      // Send notification to producer
      const notification = NotificationTemplates.ALLOCATION_APPROVED(
        selectedAllocation.machineName,
        normalizedValue
      );
      await scheduleNotification(notification.title, notification.body);

      Alert.alert('Sucesso', 'Solicitação aprovada e orçamento enviado!');
      setShowModal(false);
      setSelectedAllocation(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aprovar a solicitação.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Erro', 'Informe o motivo da rejeição.');
      return;
    }

    setLoading(true);
    try {
      await updateAllocation({
        ...selectedAllocation,
        approvalStatus: 'rejected',
        rejectionReason: rejectionReason.trim(),
        rejectedAt: new Date().toISOString(),
      });

      // Send notification to producer
      const notification = NotificationTemplates.ALLOCATION_REJECTED(
        selectedAllocation.machineName,
        rejectionReason.trim()
      );
      await scheduleNotification(notification.title, notification.body);

      Alert.alert('Sucesso', 'Solicitação rejeitada.');
      setShowModal(false);
      setSelectedAllocation(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível rejeitar a solicitação.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.danger;
      default:
        return theme.colors.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aprovações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingRequests.length}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{allocations.filter(a => a.approvalStatus === 'approved').length}</Text>
            <Text style={styles.statLabel}>Aprovadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{allocations.filter(a => a.approvalStatus === 'rejected').length}</Text>
            <Text style={styles.statLabel}>Rejeitadas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Solicitações Pendentes</Text>

        {pendingRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="checkmark-circle-outline" size={48} color={theme.colors.success} />
            <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
          </View>
        ) : (
          pendingRequests.map((request) => (
            <TouchableOpacity key={request.id} style={styles.requestCard} onPress={() => openApprovalModal(request)}>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <Text style={styles.machineName}>{request.machineName}</Text>
                  <Text style={styles.clientName}>{request.clientName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.approvalStatus) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(request.approvalStatus) }]}>
                    {request.approvalStatus === 'pending' ? 'Pendente' : request.approvalStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailItem}>
                  <Icon name="construct-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.detailText}>{request.serviceType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.detailText}>{request.startDate} - {request.endDate}</Text>
                </View>
              </View>

              {request.observations && (
                <Text style={styles.observations} numberOfLines={2}>
                  Obs: {request.observations}
                </Text>
              )}

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Aprovar/Rejeitar</Text>
                <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aprovar Solicitação</Text>
            
            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>Máquina:</Text>
              <Text style={styles.modalInfoValue}>{selectedAllocation?.machineName}</Text>
              
              <Text style={styles.modalInfoLabel}>Cliente:</Text>
              <Text style={styles.modalInfoValue}>{selectedAllocation?.clientName}</Text>
              
              <Text style={styles.modalInfoLabel}>Serviço:</Text>
              <Text style={styles.modalInfoValue}>{selectedAllocation?.serviceType}</Text>
              
              <Text style={styles.modalInfoLabel}>Período:</Text>
              <Text style={styles.modalInfoValue}>{selectedAllocation?.startDate} - {selectedAllocation?.endDate}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Icon name="cash-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Valor do orçamento (ex: 2500,00)"
                placeholderTextColor={theme.colors.textLight}
                value={quoteValue}
                onChangeText={setQuoteValue}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="document-text-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Motivo da rejeição (se rejeitar)"
                placeholderTextColor={theme.colors.textLight}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={loading}
              >
                <Text style={styles.rejectButtonText}>Rejeitar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.approveButton]}
                onPress={handleApprove}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.approveButtonText}>Processando...</Text>
                ) : (
                  <Text style={styles.approveButtonText}>Aprovar</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  observations: {
    fontSize: 13,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  modalInfo: {
    marginBottom: 20,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 8,
  },
  modalInfoValue: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  rejectButton: {
    backgroundColor: theme.colors.danger,
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textLight,
    fontWeight: '600',
    fontSize: 16,
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
  },
  subMessage: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});

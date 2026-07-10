import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert, Modal, TextInput, Animated, Easing, Platform, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

function AnimatedCard({ children, index, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

export default function ConsortiumDetail({ route }) {
  const { consortium: initialConsortium } = route.params;
  const { consortiums, updateConsortium, clients, deleteConsortium } = useContext(AppContext);
  const navigation = useNavigation();

  const handleDeleteConsortium = () => {
    const confirmDelete = () => {
      deleteConsortium(initialConsortium.id);
      if (Platform.OS === 'web') {
        window.alert('Consórcio Excluído.');
      }
      navigation.goBack();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja EXCLUIR este consórcio inteiro? Esta ação apagará todo o histórico.')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Excluir Consórcio',
        'Tem certeza que deseja EXCLUIR este consórcio inteiro?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim, Excluir', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMonthlyValue, setEditMonthlyValue] = useState('');
  const [editPrizeValue, setEditPrizeValue] = useState('');
  const [editDurationMonths, setEditDurationMonths] = useState('');
  const [editDrawDay, setEditDrawDay] = useState('');

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const consortium = consortiums.find(c => c.id === initialConsortium.id) || initialConsortium;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const hasPaidCurrentMonth = (participant) => {
    if (!participant.payments || !Array.isArray(participant.payments)) return false;
    return participant.payments.some(p => p.month === currentMonth && p.year === currentYear);
  };

  const handlePayment = (participantId) => {
    const participant = consortium.participants.find(p => p.id === participantId);
    if (!participant) return;
    
    if (hasPaidCurrentMonth(participant)) {
      Alert.alert('Aviso', 'Este participante já pagou a mensalidade deste mês.');
      return;
    }

    const monthlyVal = typeof consortium.monthlyValue === 'number' ? consortium.monthlyValue : 0;
    const msg = `Dar baixa de R$ ${monthlyVal.toFixed(2)} para "${participant.name}" referente a ${currentMonth}/${currentYear}?`;

    const confirmPayment = () => {
      const newPayment = {
        id: Date.now().toString(),
        month: currentMonth,
        year: currentYear,
        date: now.toISOString(),
      };
      const updatedParticipants = consortium.participants.map(p => {
        if (p.id === participantId) {
          const payments = Array.isArray(p.payments) ? [...p.payments, newPayment] : [newPayment];
          return { ...p, paidMonths: payments.length, payments };
        }
        return p;
      });
      updateConsortium({ ...consortium, participants: updatedParticipants });
      if (Platform.OS === 'web') {
        window.alert(`✓ Pagamento registrado! ${participant.name} pagou ${currentMonth}/${currentYear}.`);
      } else {
        Alert.alert('✓ Pagamento registrado!', `${participant.name} pagou ${currentMonth}/${currentYear}.`);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Confirmar Pagamento\n\n${msg}`)) {
        confirmPayment();
      }
    } else {
      Alert.alert(
        'Confirmar Pagamento',
        msg,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: confirmPayment }
        ]
      );
    }
  };

  const handleAddParticipant = (client) => {
    const exists = consortium.participants.find(p => p.clientId === client.id);
    if (exists) {
      Alert.alert('Erro', 'Este cliente já está no consórcio.');
      return;
    }

    const newParticipant = {
      id: 'p' + Date.now(),
      clientId: client.id,
      name: client.name,
      hasWon: false,
      paidMonths: 0,
      payments: [],
    };

    const updatedParticipants = [...consortium.participants, newParticipant];
    updateConsortium({ ...consortium, participants: updatedParticipants });
    setClientSearch('');
    setShowAddModal(false);
    Alert.alert('Sucesso', `${newParticipant.name} foi adicionado(a) ao consórcio.`);
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  const handleRemoveParticipant = (participantId) => {
    const participant = consortium.participants.find(p => p.id === participantId);
    if (!participant) return;
    
    const msg = `Tem certeza que deseja remover "${participant.name}" do consórcio? Esta ação não pode ser desfeita.`;

    const confirmRemove = () => {
      const updatedParticipants = consortium.participants.filter(p => p.id !== participantId);
      updateConsortium({ ...consortium, participants: updatedParticipants });
      if (Platform.OS === 'web') {
        window.alert(`Removido: ${participant.name} foi removido(a) do consórcio.`);
      } else {
        Alert.alert('Removido', `${participant.name} foi removido(a) do consórcio.`);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Remover Participante\n\n${msg}`)) {
        confirmRemove();
      }
    } else {
      Alert.alert(
        'Remover Participante',
        msg,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim, Remover', style: 'destructive', onPress: confirmRemove }
        ]
      );
    }
  };

  const openEditModal = () => {
    setEditName(consortium.name);
    setEditMonthlyValue(consortium.monthlyValue ? consortium.monthlyValue.toString() : '0');
    setEditPrizeValue(consortium.prizeValue ? consortium.prizeValue.toString() : '');
    setEditDurationMonths(consortium.durationMonths ? consortium.durationMonths.toString() : '12');
    setEditDrawDay(consortium.drawDay ? consortium.drawDay.toString() : '15');
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editName || !editMonthlyValue || !editDurationMonths || !editDrawDay) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios.');
      return;
    }

    const updatedConsortium = {
      ...consortium,
      name: editName,
      monthlyValue: parseFloat(editMonthlyValue.replace(',', '.')),
      prizeValue: editPrizeValue ? parseFloat(editPrizeValue.replace(',', '.')) : null,
      durationMonths: parseInt(editDurationMonths, 10),
      drawDay: parseInt(editDrawDay, 10),
    };

    updateConsortium(updatedConsortium);
    setShowEditModal(false);
    Alert.alert('Sucesso', 'Consórcio atualizado.');
  };

  const totalPaid = consortium.participants.filter(p => hasPaidCurrentMonth(p)).length;
  const totalParticipants = consortium.participants.length;

  const renderItem = ({ item, index }) => {
    const isPaidThisMonth = hasPaidCurrentMonth(item);
    const paidCount = Array.isArray(item.payments) ? item.payments.length : (item.paidMonths || 0);
    const duration = consortium.durationMonths || 12;
    const progress = Math.min((paidCount / duration) * 100, 100);

    return (
      <AnimatedCard index={index} style={styles.participantCard}>
        {/* Top: Name + Badge */}
        <View style={styles.cardTop}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{flex: 1, marginLeft: 12}}>
            <Text style={styles.participantName}>{item.name}</Text>
            {item.hasWon && (
              <View style={styles.winnerBadge}>
                <Icon name="star" size={10} color="#fff" style={{marginRight: 3}} />
                <Text style={styles.winnerBadgeText}>Contemplado</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusDot, { backgroundColor: isPaidThisMonth ? theme.colors.success : theme.colors.danger }]} />
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progresso:</Text>
            <Text style={styles.progressValue}>{paidCount}/{duration} meses</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={[styles.monthStatus, { color: isPaidThisMonth ? theme.colors.success : theme.colors.danger }]}>
            {isPaidThisMonth ? `✓ Pago em ${currentMonth}/${currentYear}` : `⚠ Pendente ${currentMonth}/${currentYear}`}
          </Text>
        </View>

        {/* Action Buttons - FULL WIDTH */}
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionBtnPay, isPaidThisMonth && styles.actionBtnPayDisabled]}
            onPress={() => handlePayment(item.id)}
            disabled={isPaidThisMonth}
            activeOpacity={0.7}
          >
            <Icon name={isPaidThisMonth ? "checkmark-circle" : "cash-outline"} size={18} color="#fff" style={{marginRight: 6}} />
            <Text style={styles.actionBtnPayText}>
              {isPaidThisMonth ? 'PAGO ESTE MÊS' : 'DAR BAIXA'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtnRemove}
            onPress={() => handleRemoveParticipant(item.id)}
            activeOpacity={0.7}
          >
            <Icon name="person-remove-outline" size={18} color={theme.colors.danger} style={{marginRight: 6}} />
            <Text style={styles.actionBtnRemoveText}>REMOVER</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
            <Icon name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{consortium.name}</Text>
        <Text style={styles.subTitle}>Duração: {consortium.durationMonths} meses • Sorteio dia {consortium.drawDay || 15}</Text>
        <View style={styles.headerCards}>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatValue}>R$ {consortium.monthlyValue ? consortium.monthlyValue.toFixed(2) : '0.00'}</Text>
            <Text style={styles.headerStatLabel}>Mensalidade</Text>
          </View>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatValue}>{totalPaid}/{totalParticipants}</Text>
            <Text style={styles.headerStatLabel}>Pagos este mês</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Participantes ({totalParticipants})</Text>
        <TouchableOpacity 
          style={styles.addParticipantBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Icon name="person-add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={consortium.participants}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={50} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum participante cadastrado.</Text>
            <Text style={styles.emptySubText}>Toque em "Adicionar" para incluir participantes.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.drawButton}
          onPress={() => navigation.navigate('Draws', { consortiumId: consortium.id })}
          activeOpacity={0.8}
        >
          <Icon name="gift" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.drawButtonText}>Ir para Sorteio</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para adicionar participante */}
      <Modal visible={showAddModal} transparent={true} animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
              <Text style={[styles.modalTitle, {marginBottom: 0}]}>Adicionar Cliente</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputContainer}>
              <Icon name="search" size={20} color={theme.colors.textLight} style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Buscar cliente..."
                value={clientSearch}
                onChangeText={setClientSearch}
                placeholderTextColor="#999"
                autoFocus={true}
              />
            </View>

            {filteredClients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
              </View>
            ) : (
              <FlatList
                data={filteredClients}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.clientOption}
                    onPress={() => handleAddParticipant(item)}
                  >
                    <View style={styles.clientAvatar}>
                      <Text style={styles.clientAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.clientName}>{item.name}</Text>
                    <Icon name="add-circle" size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Consórcio */}
      <Modal visible={showEditModal} transparent={true} animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%', padding: 20 }]}>
            <Text style={styles.modalTitle}>Editar Consórcio</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={styles.label}>Nome</Text>
              <View style={styles.modalInputContainer}>
                <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />
              </View>

              <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Mensalidade (R$)</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput style={styles.modalInput} value={editMonthlyValue} onChangeText={setEditMonthlyValue} keyboardType="numeric" />
                  </View>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Duração (meses)</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput style={styles.modalInput} value={editDurationMonths} onChangeText={setEditDurationMonths} keyboardType="numeric" />
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Prêmio Fixo (R$) (Opcional)</Text>
              <View style={styles.modalInputContainer}>
                <TextInput style={styles.modalInput} value={editPrizeValue} onChangeText={setEditPrizeValue} keyboardType="numeric" placeholder="Calculado auto se vazio" />
              </View>

              <Text style={styles.label}>Dia do Sorteio (ex: 15)</Text>
              <View style={styles.modalInputContainer}>
                <TextInput style={styles.modalInput} value={editDrawDay} onChangeText={setEditDrawDay} keyboardType="numeric" />
              </View>

              <View style={[styles.modalButtons, { marginTop: 10 }]}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowEditModal(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveEdit}>
                  <Text style={styles.modalConfirmText}>Salvar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{marginTop: 20, alignItems: 'center', padding: 10}} onPress={handleDeleteConsortium}>
                <Text style={{color: theme.colors.danger, fontWeight: 'bold', fontSize: 16}}>Excluir Consórcio Inteiro</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 40,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: { padding: 5 },
  editButton: { padding: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 30, marginBottom: 5, textAlign: 'center' },
  subTitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 15, textAlign: 'center' },
  headerCards: { flexDirection: 'row', marginTop: 5, gap: 10 },
  headerStatCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerStatValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  addParticipantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
  },
  addBtnText: { marginLeft: 6, color: '#fff', fontWeight: 'bold', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  // Participant Card — VERTICAL LAYOUT
  participantCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  participantName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  winnerBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  // Progress
  progressSection: { marginBottom: 14 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: theme.colors.textLight },
  progressValue: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text },
  progressBarBg: { height: 8, backgroundColor: '#E8ECEF', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.secondary, borderRadius: 4 },
  monthStatus: { fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  // Action Buttons — FULL WIDTH ROW
  cardActions: { flexDirection: 'row', gap: 10 },
  actionBtnPay: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPayDisabled: { backgroundColor: '#B0BEC5' },
  actionBtnPayText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  actionBtnRemove: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FDECEC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F8D7DA',
  },
  actionBtnRemoveText: { color: theme.colors.danger, fontWeight: 'bold', fontSize: 12 },
  // Client Option
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  clientAvatarText: { color: '#fff', fontWeight: 'bold' },
  clientName: { flex: 1, fontSize: 16, color: theme.colors.text, fontWeight: '600' },
  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyText: { marginTop: 10, fontSize: 16, color: theme.colors.textLight, fontWeight: 'bold' },
  emptySubText: { marginTop: 5, fontSize: 14, color: theme.colors.textLight },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.card,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 10,
  },
  drawButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '85%', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 20, textAlign: 'center' },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  modalInputIcon: { marginRight: 10 },
  modalInput: { flex: 1, height: 48, fontSize: 16, color: theme.colors.text },
  label: { fontSize: 13, color: theme.colors.textLight, marginBottom: 5, fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', marginRight: 10 },
  modalCancelText: { color: theme.colors.textLight, fontWeight: '600', fontSize: 16 },
  modalConfirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center', marginLeft: 10 },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
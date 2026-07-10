import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function ProducerDashboard() {
  const navigation = useNavigation();
  const { allocations, currentUser, userRole } = useContext(AppContext);

  if (userRole !== 'producer') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Icon name="lock-closed" size={64} color={theme.colors.textLight} />
          <Text style={styles.message}>Acesso restrito</Text>
          <Text style={styles.subMessage}>Esta tela é exclusiva para produtores.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const myAllocations = useMemo(() => 
    allocations.filter(a => a.requestedBy === currentUser?.uid),
    [allocations, currentUser]
  );

  const pendingRequests = useMemo(() => 
    myAllocations.filter(a => a.approvalStatus === 'pending' || a.status === 'Pendente'),
    [myAllocations]
  );

  const approvedRequests = useMemo(() => 
    myAllocations.filter(a => a.approvalStatus === 'approved' && (a.status === 'Agendadas' || a.status === 'Em andamento')),
    [myAllocations]
  );

  const completedRequests = useMemo(() => 
    myAllocations.filter(a => a.status === 'Concluídas'),
    [myAllocations]
  );

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `R$ ${number.toFixed(2).replace('.', ',')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return theme.colors.secondary;
      case 'Agendadas':
        return theme.colors.primary;
      case 'Em andamento':
        return theme.colors.success;
      case 'Concluídas':
        return theme.colors.textLight;
      default:
        return theme.colors.textLight;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Serviços</Text>
        <TouchableOpacity style={styles.requestButton} onPress={() => navigation.navigate('ServiceRequest')}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="time-outline" size={32} color={theme.colors.secondary} />
            <Text style={styles.statNumber}>{pendingRequests.length}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="checkmark-circle-outline" size={32} color={theme.colors.success} />
            <Text style={styles.statNumber}>{approvedRequests.length}</Text>
            <Text style={styles.statLabel}>Em Andamento</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="flag-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{completedRequests.length}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Solicitações Pendentes</Text>
        {pendingRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="checkmark-circle" size={40} color={theme.colors.success} />
            <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
          </View>
        ) : (
          pendingRequests.map((request) => (
            <TouchableOpacity key={request.id} style={styles.card} onPress={() => navigation.navigate('AllocationDetail', { allocation: request })}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.machineName}>{request.machineName}</Text>
                  <Text style={styles.serviceType}>{request.serviceType}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                    {request.status}
                  </Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.detailText}>{request.startDate} - {request.endDate}</Text>
                </View>
              </View>
              <Text style={styles.waitingText}>Aguardando aprovação do administrador</Text>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.sectionTitle}>Serviços em Andamento</Text>
        {approvedRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={40} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum serviço em andamento</Text>
          </View>
        ) : (
          approvedRequests.map((request) => (
            <TouchableOpacity key={request.id} style={styles.card} onPress={() => navigation.navigate('AllocationDetail', { allocation: request })}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.machineName}>{request.machineName}</Text>
                  <Text style={styles.serviceType}>{request.serviceType}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                    {request.status}
                  </Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.detailText}>{request.startDate} - {request.endDate}</Text>
                </View>
                {request.rentalValue > 0 && (
                  <View style={styles.detailItem}>
                    <Icon name="cash-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.detailText}>{formatCurrency(request.rentalValue)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.sectionTitle}>Histórico</Text>
        {completedRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="time-outline" size={40} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum serviço concluído</Text>
          </View>
        ) : (
          completedRequests.slice(0, 5).map((request) => (
            <TouchableOpacity key={request.id} style={styles.card} onPress={() => navigation.navigate('AllocationDetail', { allocation: request })}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.machineName}>{request.machineName}</Text>
                  <Text style={styles.serviceType}>{request.serviceType}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                    Concluído
                  </Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.detailText}>{request.startDate} - {request.endDate}</Text>
                </View>
                {request.actualEndDate && (
                  <View style={styles.detailItem}>
                    <Icon name="checkmark-circle-outline" size={16} color={theme.colors.success} />
                    <Text style={styles.detailText}>Finalizado: {request.actualEndDate}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  requestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 8,
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
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textLight,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  serviceType: {
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
  cardDetails: {
    marginBottom: 8,
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
  waitingText: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontStyle: 'italic',
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

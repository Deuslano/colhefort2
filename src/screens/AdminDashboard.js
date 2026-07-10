import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { allocations, machines, clients, userRole, expenses, accountsReceivable } = useContext(AppContext);

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Icon name="lock-closed" size={64} color={theme.colors.textLight} />
          <Text style={styles.message}>Acesso restrito</Text>
          <Text style={styles.subMessage}>Esta tela é exclusiva para administradores.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pendingApprovals = useMemo(() => 
    allocations.filter(a => a.approvalStatus === 'pending' || a.status === 'Pendente'),
    [allocations]
  );

  const activeAllocations = useMemo(() => 
    allocations.filter(a => a.status === 'Em andamento' || a.status === 'Agendadas'),
    [allocations]
  );

  const availableMachines = useMemo(() => 
    machines.filter(m => m.status === 'Disponível'),
    [machines]
  );

  const totalRevenue = useMemo(() => 
    accountsReceivable.reduce((sum, acc) => sum + (acc.amount || 0), 0),
    [accountsReceivable]
  );

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    [expenses]
  );

  const netProfit = totalRevenue - totalExpenses;

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `R$ ${number.toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.financialStatsContainer}>
          <View style={styles.financialStatCard}>
            <Icon name="trending-up-outline" size={24} color={theme.colors.success} />
            <Text style={styles.financialStatLabel}>Receita Total</Text>
            <Text style={styles.financialStatValue}>{formatCurrency(totalRevenue)}</Text>
          </View>
          <View style={styles.financialStatCard}>
            <Icon name="trending-down-outline" size={24} color={theme.colors.danger} />
            <Text style={styles.financialStatLabel}>Despesas</Text>
            <Text style={styles.financialStatValue}>{formatCurrency(totalExpenses)}</Text>
          </View>
          <View style={styles.financialStatCard}>
            <Icon name="wallet-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.financialStatLabel}>Lucro Líquido</Text>
            <Text style={[styles.financialStatValue, netProfit >= 0 ? styles.profit : styles.loss]}>
              {formatCurrency(netProfit)}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('ApprovalScreen')}>
            <Icon name="time-outline" size={32} color={theme.colors.secondary} />
            <Text style={styles.statNumber}>{pendingApprovals.length}</Text>
            <Text style={styles.statLabel}>Aprovações Pendentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Allocations')}>
            <Icon name="construct-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{activeAllocations.length}</Text>
            <Text style={styles.statLabel}>Alocações Ativas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Machines')}>
            <Icon name="leaf-outline" size={32} color={theme.colors.success} />
            <Text style={styles.statNumber}>{availableMachines.length}</Text>
            <Text style={styles.statLabel}>Máquinas Disponíveis</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ApprovalScreen')}>
            <View style={styles.actionIconContainer}>
              <Icon name="checkmark-circle-outline" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Aprovações</Text>
            <Text style={styles.actionDescription}>Gerencie solicitações de serviço</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('UserManagement')}>
            <View style={styles.actionIconContainer}>
              <Icon name="people-outline" size={32} color={theme.colors.secondary} />
            </View>
            <Text style={styles.actionTitle}>Usuários</Text>
            <Text style={styles.actionDescription}>Gerencie produtores e administradores</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Machines')}>
            <View style={styles.actionIconContainer}>
              <Icon name="leaf-outline" size={32} color={theme.colors.success} />
            </View>
            <Text style={styles.actionTitle}>Máquinas</Text>
            <Text style={styles.actionDescription}>Gerencie o parque de máquinas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Allocations')}>
            <View style={styles.actionIconContainer}>
              <Icon name="calendar-outline" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Alocações</Text>
            <Text style={styles.actionDescription}>Visualize todas as alocações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FinancialSummary')}>
            <View style={styles.actionIconContainer}>
              <Icon name="wallet-outline" size={32} color={theme.colors.secondary} />
            </View>
            <Text style={styles.actionTitle}>Financeiro</Text>
            <Text style={styles.actionDescription}>Resumo financeiro detalhado</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FinancialReports')}>
            <View style={styles.actionIconContainer}>
              <Icon name="document-text-outline" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Relatórios</Text>
            <Text style={styles.actionDescription}>Relatórios financeiros</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Solicitações Recentes</Text>
        {pendingApprovals.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="checkmark-circle" size={40} color={theme.colors.success} />
            <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
          </View>
        ) : (
          pendingApprovals.slice(0, 3).map((request) => (
            <TouchableOpacity key={request.id} style={styles.card} onPress={() => navigation.navigate('ApprovalScreen')}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.machineName}>{request.machineName}</Text>
                  <Text style={styles.clientName}>{request.clientName}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Pendente</Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Icon name="construct-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.detailText}>{request.serviceType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                  <Text style={styles.detailText}>{request.startDate} - {request.endDate}</Text>
                </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  financialStatsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  financialStatCard: {
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
  financialStatLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  financialStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 4,
  },
  profit: {
    color: theme.colors.success,
  },
  loss: {
    color: theme.colors.danger,
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
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: theme.colors.textLight,
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
  clientName: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondary,
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

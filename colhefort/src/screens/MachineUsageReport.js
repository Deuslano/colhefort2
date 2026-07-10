import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function MachineUsageReport() {
  const navigation = useNavigation();
  const { allocations, machines, isDarkMode } = useContext(AppContext);
  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const machineUsage = useMemo(() => {
    const usageMap = {};
    
    (allocations || []).forEach((allocation) => {
      const machineId = allocation.machineId;
      if (!machineId) return;
      
      if (!usageMap[machineId]) {
        const machine = (machines || []).find(m => m.id === machineId);
        usageMap[machineId] = {
          machineId,
          machineName: machine?.name || 'Máquina não identificada',
          machineModel: machine?.model || '',
          machineImage: machine?.imageUrl || null,
          allocationCount: 0,
          totalValue: 0,
          clients: new Set(),
          statuses: {},
        };
      }
      
      usageMap[machineId].allocationCount++;
      usageMap[machineId].totalValue += allocation.value || 0;
      
      if (allocation.clientName) {
        usageMap[machineId].clients.add(allocation.clientName);
      }
      
      const status = allocation.status || 'Sem status';
      usageMap[machineId].statuses[status] = (usageMap[machineId].statuses[status] || 0) + 1;
    });

    const usageArray = Object.values(usageMap).map(item => ({
      ...item,
      clients: Array.from(item.clients),
      uniqueClients: item.clients.size,
    }));

    return usageArray.sort((a, b) => b.allocationCount - a.allocationCount);
  }, [allocations, machines]);

  const mostUsed = machineUsage.slice(0, 5);
  const leastUsed = [...machineUsage].reverse().slice(0, 5);
  const totalAllocations = (allocations || []).length;
  const totalMachines = (machines || []).length;
  const avgUsage = totalMachines > 0 ? (totalAllocations / totalMachines).toFixed(1) : 0;

  const getUsageColor = (count, avg) => {
    if (count === 0) return theme.colors.textLight;
    if (count > avg * 1.5) return theme.colors.success;
    if (count > avg) return theme.colors.primary;
    if (count > avg * 0.5) return theme.colors.secondary;
    return theme.colors.danger;
  };

  const getUsageLabel = (count, avg) => {
    if (count === 0) return 'Sem uso';
    if (count > avg * 1.5) return 'Alta';
    if (count > avg) return 'Acima da média';
    if (count > avg * 0.5) return 'Abaixo da média';
    return 'Baixa';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório de Utilização</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.primary + '20', borderWidth: 1 }]}>
            <View style={[styles.summaryIconContainer, { backgroundColor: currentTheme.primary + '15' }]}>
              <Icon name="construct" size={20} color={currentTheme.primary} />
            </View>
            <Text style={[styles.summaryLabel, { color: currentTheme.textLight }]}>Total de Máquinas</Text>
            <Text style={[styles.summaryValue, { color: currentTheme.text }]}>{totalMachines}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.success + '20', borderWidth: 1 }]}>
            <View style={[styles.summaryIconContainer, { backgroundColor: currentTheme.success + '15' }]}>
              <Icon name="calendar" size={20} color={currentTheme.success} />
            </View>
            <Text style={[styles.summaryLabel, { color: currentTheme.textLight }]}>Total de Alocações</Text>
            <Text style={[styles.summaryValue, { color: currentTheme.text }]}>{totalAllocations}</Text>
          </View>
        </View>

        <View style={[styles.avgCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.secondary + '20', borderWidth: 1 }]}>
          <View style={[styles.avgIconContainer, { backgroundColor: currentTheme.secondary + '15' }]}>
            <Icon name="stats-chart" size={24} color={currentTheme.secondary} />
          </View>
          <View style={styles.avgInfo}>
            <Text style={[styles.avgLabel, { color: currentTheme.textLight }]}>Média de uso por máquina</Text>
            <Text style={[styles.avgValue, { color: currentTheme.text }]}>{avgUsage} alocações</Text>
          </View>
        </View>

        {/* Most Used Machines */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Máquinas Mais Utilizadas</Text>
          {mostUsed.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="construct-outline" size={40} color={currentTheme.textLight} />
              <Text style={[styles.emptyText, { color: currentTheme.textLight }]}>Sem dados de utilização</Text>
            </View>
          ) : (
            mostUsed.map((item, index) => (
              <View key={item.machineId} style={[styles.usageCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}>
                <View style={styles.usageHeader}>
                  <View style={styles.rankContainer}>
                    <Text style={styles.rank}>{index + 1}</Text>
                  </View>
                  <View style={styles.machineInfo}>
                    <Text style={[styles.machineName, { color: currentTheme.text }]}>{item.machineName}</Text>
                    <Text style={[styles.machineModel, { color: currentTheme.textLight }]}>{item.machineModel}</Text>
                  </View>
                  <View style={[styles.usageBadge, { backgroundColor: getUsageColor(item.allocationCount, avgUsage) + '15', borderColor: getUsageColor(item.allocationCount, avgUsage) + '30', borderWidth: 1 }]}>
                    <Text style={[styles.usageBadgeText, { color: getUsageColor(item.allocationCount, avgUsage) }]}>
                      {getUsageLabel(item.allocationCount, avgUsage)}
                    </Text>
                  </View>
                </View>
                <View style={styles.usageStats}>
                  <View style={styles.statItem}>
                    <Icon name="calendar-outline" size={16} color={currentTheme.textLight} />
                    <Text style={[styles.statText, { color: currentTheme.textLight }]}>{item.allocationCount} alocações</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="people-outline" size={16} color={currentTheme.textLight} />
                    <Text style={[styles.statText, { color: currentTheme.textLight }]}>{item.uniqueClients} clientes</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Least Used Machines */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Máquinas Menos Utilizadas</Text>
          {leastUsed.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="construct-outline" size={40} color={currentTheme.textLight} />
              <Text style={[styles.emptyText, { color: currentTheme.textLight }]}>Sem dados de utilização</Text>
            </View>
          ) : (
            leastUsed.map((item, index) => (
              <View key={item.machineId} style={[styles.usageCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}>
                <View style={styles.usageHeader}>
                  <View style={[styles.rankContainer, { backgroundColor: currentTheme.danger + '15' }]}>
                    <Text style={[styles.rank, { color: currentTheme.danger }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.machineInfo}>
                    <Text style={[styles.machineName, { color: currentTheme.text }]}>{item.machineName}</Text>
                    <Text style={[styles.machineModel, { color: currentTheme.textLight }]}>{item.machineModel}</Text>
                  </View>
                  <View style={[styles.usageBadge, { backgroundColor: getUsageColor(item.allocationCount, avgUsage) + '15', borderColor: getUsageColor(item.allocationCount, avgUsage) + '30', borderWidth: 1 }]}>
                    <Text style={[styles.usageBadgeText, { color: getUsageColor(item.allocationCount, avgUsage) }]}>
                      {getUsageLabel(item.allocationCount, avgUsage)}
                    </Text>
                  </View>
                </View>
                <View style={styles.usageStats}>
                  <View style={styles.statItem}>
                    <Icon name="calendar-outline" size={16} color={currentTheme.textLight} />
                    <Text style={[styles.statText, { color: currentTheme.textLight }]}>{item.allocationCount} alocações</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="people-outline" size={16} color={currentTheme.textLight} />
                    <Text style={[styles.statText, { color: currentTheme.textLight }]}>{item.uniqueClients} clientes</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
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
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  avgIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avgInfo: {
    flex: 1,
  },
  avgLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  avgValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  usageCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  machineModel: {
    fontSize: 13,
  },
  usageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usageBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  usageStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    marginLeft: 6,
  },
});

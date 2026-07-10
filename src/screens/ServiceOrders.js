import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function ServiceOrders() {
  const navigation = useNavigation();
  const { serviceOrders, allocations, machines, clients } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState('Pendentes');

  const tabs = ['Pendentes', 'Em andamento', 'Concluídas'];
  const filteredOrders = serviceOrders.filter((order) => order.status === selectedTab);

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `R$ ${number.toFixed(2).replace('.', ',')}`;
  };

  const getMachineName = (order) => {
    if (order.machineName) return order.machineName;
    const machine = machines.find((item) => item.id === order.machineId);
    return machine?.name || 'Máquina não informada';
  };

  const getClientName = (order) => {
    if (order.clientName) return order.clientName;
    const client = clients.find((item) => item.id === order.clientId);
    return client?.name || 'Cliente não informado';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ordens de Serviço</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, selectedTab === tab && styles.activeTab]} onPress={() => setSelectedTab(tab)}>
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="document-text-outline" size={64} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhuma ordem de serviço nesta etapa.</Text>
            <Text style={styles.emptySubtext}>As ordens são criadas automaticamente quando você faz uma alocação.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.orderCard}
              onPress={() => {
                const allocation = allocations.find(a => a.id === order.allocationId);
                if (allocation) {
                  navigation.navigate('AllocationDetail', { allocation });
                }
              }}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderIdBadge}>
                  <Icon name="document-text" size={20} color="#fff" />
                  <Text style={styles.orderIdText}>#{order.id?.slice(-6).toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Icon name={getStatusIcon(order.status)} size={14} color={getStatusColor(order.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.orderBody}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Icon name="construct" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Máquina</Text>
                    <Text style={styles.infoValue}>{getMachineName(order)}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Icon name="person" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Cliente</Text>
                    <Text style={styles.infoValue}>{getClientName(order)}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Icon name="leaf" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Serviço</Text>
                    <Text style={styles.infoValue}>{order.serviceType || 'Não informado'}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Icon name="cash" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Valor</Text>
                    <Text style={styles.infoValue}>{formatCurrency(order.rentalValue)}</Text>
                  </View>
                </View>

                {order.actualStartDate && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Icon name="play-circle" size={18} color="#4CAF50" />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Início</Text>
                      <Text style={styles.infoValue}>{order.actualStartDate}</Text>
                    </View>
                  </View>
                )}

                {order.actualEndDate && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Icon name="checkmark-circle" size={18} color="#2196F3" />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Término</Text>
                      <Text style={styles.infoValue}>{order.actualEndDate}</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.periodText}>{order.startDate} - {order.endDate}</Text>
                <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Pendentes': return '#FFA500';
    case 'Em andamento': return '#4CAF50';
    case 'Concluídas': return '#2196F3';
    default: return '#9E9E9E';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pendentes': return 'time';
    case 'Em andamento': return 'play-circle';
    case 'Concluídas': return 'checkmark-circle';
    default: return 'help-circle';
  }
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: theme.colors.primary },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', marginRight: 8 },
  activeTab: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 14, color: theme.colors.textLight, fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 16, color: theme.colors.textLight, marginTop: 16, fontWeight: '500' },
  emptySubtext: { fontSize: 14, color: theme.colors.textLight, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  orderCard: { backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderIdBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  orderIdText: { fontSize: 12, fontWeight: 'bold', color: '#fff', marginLeft: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  orderBody: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: theme.colors.textLight, marginBottom: 2 },
  infoValue: { fontSize: 14, color: theme.colors.text, fontWeight: '500' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  periodText: { fontSize: 12, color: theme.colors.textLight },
});

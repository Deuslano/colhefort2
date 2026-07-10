import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function MyAllocations() {
  const navigation = useNavigation();
  const { allocations, currentUser, isDarkMode } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState('all');

  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const userAllocations = useMemo(() => {
    return allocations.filter(a => a.clientId === currentUser?.uid);
  }, [allocations, currentUser]);

  const filteredAllocations = useMemo(() => {
    if (selectedTab === 'pending') {
      return userAllocations.filter(a => a.approvalStatus === 'pending');
    } else if (selectedTab === 'approved') {
      return userAllocations.filter(a => a.approvalStatus === 'approved');
    } else if (selectedTab === 'completed') {
      return userAllocations.filter(a => a.status === 'Concluída');
    }
    return userAllocations;
  }, [userAllocations, selectedTab]);

  const getStatusColor = (status, approvalStatus) => {
    if (approvalStatus === 'approved') return currentTheme.success;
    if (approvalStatus === 'pending') return currentTheme.warning;
    if (status === 'Concluída') return currentTheme.primary;
    return currentTheme.textLight;
  };

  const getStatusText = (status, approvalStatus) => {
    if (approvalStatus === 'approved') return 'Aprovada';
    if (approvalStatus === 'pending') return 'Pendente';
    if (status === 'Concluída') return 'Concluída';
    return status;
  };

  const getStatusIcon = (status, approvalStatus) => {
    if (approvalStatus === 'approved') return 'checkmark-circle';
    if (approvalStatus === 'pending') return 'time';
    if (status === 'Concluída') return 'checkmark-done-circle';
    return 'information-circle';
  };

  const renderAllocation = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.allocationCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}
      onPress={() => navigation.navigate('AllocationDetail', { allocationId: item.id })}
    >
      <View style={styles.allocationHeader}>
        <View style={styles.allocationInfo}>
          <Icon name="leaf" size={20} color={currentTheme.primary} />
          <Text style={[styles.machineName, { color: currentTheme.text }]}>{item.machineName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, item.approvalStatus) + '20' }]}>
          <Icon name={getStatusIcon(item.status, item.approvalStatus)} size={14} color={getStatusColor(item.status, item.approvalStatus)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status, item.approvalStatus) }]}>
            {getStatusText(item.status, item.approvalStatus)}
          </Text>
        </View>
      </View>
      
      <View style={styles.allocationDetails}>
        <View style={styles.detailRow}>
          <Icon name="construct-outline" size={16} color={currentTheme.textLight} />
          <Text style={[styles.detailText, { color: currentTheme.textLight }]}>
            {item.serviceType}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color={currentTheme.textLight} />
          <Text style={[styles.detailText, { color: currentTheme.textLight }]}>
            {item.startDate} - {item.endDate}
          </Text>
        </View>
      </View>

      {item.approvalStatus === 'approved' && (
        <View style={[styles.approvedIndicator, { backgroundColor: currentTheme.success + '15' }]}>
          <Icon name="checkmark-circle" size={16} color={currentTheme.success} />
          <Text style={[styles.approvedText, { color: currentTheme.success }]}>Aprovado pelo administrador</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Alocações</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border + '30', borderBottomWidth: 1 }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab, { borderColor: selectedTab === 'all' ? currentTheme.primary : 'transparent' }]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && { color: currentTheme.primary }]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab, { borderColor: selectedTab === 'pending' ? currentTheme.warning : 'transparent' }]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && { color: currentTheme.warning }]}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'approved' && styles.activeTab, { borderColor: selectedTab === 'approved' ? currentTheme.success : 'transparent' }]}
          onPress={() => setSelectedTab('approved')}
        >
          <Text style={[styles.tabText, selectedTab === 'approved' && { color: currentTheme.success }]}>Aprovadas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab, { borderColor: selectedTab === 'completed' ? currentTheme.primary : 'transparent' }]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && { color: currentTheme.primary }]}>Concluídas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredAllocations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={64} color={currentTheme.textLight} />
            <Text style={[styles.emptyText, { color: currentTheme.textLight }]}>
              {selectedTab === 'all' ? 'Nenhuma alocação encontrada' : `Nenhuma alocação ${selectedTab === 'pending' ? 'pendente' : selectedTab === 'approved' ? 'aprovada' : 'concluída'}`}
            </Text>
          </View>
        ) : (
          filteredAllocations.map(renderAllocation)
        )}
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
    paddingVertical: 15,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  allocationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  allocationDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    marginLeft: 8,
  },
  approvedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  approvedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

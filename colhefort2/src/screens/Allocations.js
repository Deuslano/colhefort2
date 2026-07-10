import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useMemo, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function Allocations() {
  const navigation = useNavigation();
  const { allocations, machines, clients, userRole, deleteAllocation, currentUser } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState('Pendentes');
  const [searchQuery, setSearchQuery] = useState('');

  const getMachineName = (allocation) => {
    if (allocation.machineName) return allocation.machineName;
    const machine = (machines || []).find((item) => item.id === allocation.machineId);
    return machine?.name || 'Máquina não informada';
  };

  const getClientName = (allocation) => {
    if (allocation.clientName) return allocation.clientName;
    const client = (clients || []).find((item) => item.id === allocation.clientId);
    return client?.name || 'Cliente não informado';
  };

  const groupedAllocations = useMemo(() => {
    const groups = {
      Pendentes: [],
      'Em andamento': [],
      Agendadas: [],
      'Concluídas': [],
    };

    // Filter allocations for producer
    const userAllocations = userRole === 'producer' 
      ? (allocations || []).filter(a => a.clientId === currentUser?.uid)
      : (allocations || []);

    const filteredAllocations = userAllocations.filter((allocation) => {
      const query = searchQuery.toLowerCase();
      const machineName = getMachineName(allocation).toLowerCase();
      const clientName = getClientName(allocation).toLowerCase();
      const operator = (allocation.operator || '').toLowerCase();
      
      return machineName.includes(query) || clientName.includes(query) || operator.includes(query);
    });

    filteredAllocations.forEach((allocation) => {
      const status = allocation.status || 'Pendentes';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(allocation);
    });

    return groups;
  }, [allocations, searchQuery, machines, clients, userRole, currentUser]);

  const tabs = Object.keys(groupedAllocations);

  const getMachineImage = (allocation) => {
    const machine = (machines || []).find((item) => item.id === allocation.machineId);
    return machine?.imageUrl || null;
  };

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `R$ ${number.toFixed(2).replace('.', ',')}`;
  };

  const handleDeleteAllocation = (allocationId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta alocação? A máquina voltará a ficar disponível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllocation(allocationId);
              Alert.alert('Sucesso', 'Alocação excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a alocação.');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alocações</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewAllocation', { from: 'Allocations' })}
        >
          <Icon name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por máquina, cliente ou operador..."
          placeholderTextColor={theme.colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {groupedAllocations[selectedTab]?.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={40} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhuma alocação nesta etapa.</Text>
          </View>
        ) : (
          groupedAllocations[selectedTab]?.map((allocation) => (
            <View key={allocation.id} style={styles.allocationCard}>
              <TouchableOpacity
                style={styles.allocationContent}
                onPress={() => navigation.navigate('AllocationDetail', { allocation })}
              >
                <View style={styles.allocationHeader}>
                  {getMachineImage(allocation) ? (
                    <Image source={{ uri: getMachineImage(allocation) }} style={styles.machineThumbnail} />
                  ) : (
                    <View style={styles.machineThumbnailPlaceholder}>
                      <Icon name="image-outline" size={20} color={theme.colors.textLight} />
                    </View>
                  )}
                  <View style={styles.allocationInfo}>
                    <Text style={styles.machineName}>{getMachineName(allocation)}</Text>
                    <Text style={styles.clientName}>{getClientName(allocation)}</Text>
                  </View>
                </View>

                <View style={styles.allocationDates}>
                  <View style={styles.dateItem}>
                    <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.dateLabel}>Início:</Text>
                    <Text style={styles.dateValue}>{allocation.startDate || '-'}</Text>
                  </View>
                  <View style={styles.dateItem}>
                    <Icon name="calendar-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.dateLabel}>Fim:</Text>
                    <Text style={styles.dateValue}>{allocation.endDate || '-'}</Text>
                  </View>
                </View>

                <View style={styles.allocationFooter}>
                  <View style={styles.operatorInfo}>
                    <Icon name="person-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.operatorText}>{allocation.operator || 'Operador não informado'}</Text>
                  </View>
                  <Text style={styles.valueText}>{formatCurrency(allocation.rentalValue)}</Text>
                </View>
              </TouchableOpacity>
              {allocation.status === 'Pendentes' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAllocation(allocation.id)}
                >
                  <Icon name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
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
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  allocationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  allocationContent: {
    flex: 1,
    padding: 16,
  },
  deleteButton: {
    width: 50,
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  allocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  machineThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allocationInfo: {
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
  allocationDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: 4,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  allocationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginLeft: 6,
  },
  valueText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: theme.colors.textLight,
  },
});

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function Machines() {
  const navigation = useNavigation();
  const { machines, isDarkMode, userRole } = useContext(AppContext);
  const [searchText, setSearchText] = useState('');

  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const filteredMachines = (machines || [])
    .filter((m) => {
      const searchLower = searchText.toLowerCase();
      return (
        m.name?.toLowerCase().includes(searchLower) ||
        m.model?.toLowerCase().includes(searchLower) ||
        m.operator?.toLowerCase().includes(searchLower) ||
        m.clientName?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em andamento':
        return theme.colors.primary;
      case 'Agendado':
        return theme.colors.secondary;
      case 'Disponível':
        return theme.colors.success;
      default:
        return theme.colors.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Em andamento':
        return 'play-circle';
      case 'Agendado':
        return 'calendar';
      case 'Disponível':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <View style={styles.headerContent}>
          <Icon name="leaf" size={24} color={currentTheme.primary} style={styles.headerIcon} />
          <Text style={[styles.headerTitle, { color: currentTheme.primary }]}>Máquinas</Text>
        </View>
        {userRole !== 'producer' && (
          <TouchableOpacity style={[styles.addButton, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]} onPress={() => navigation.navigate('NewMachine')}>
            <Icon name="add" size={22} color={currentTheme.primary} />
          </TouchableOpacity>
        )}
        {userRole === 'producer' && <View style={{ width: 40 }} />}
      </View>

      <View style={[styles.searchContainer, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
        <Icon name="search" size={20} color={currentTheme.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: currentTheme.text }]}
          placeholder="Buscar por nome, modelo, operador..."
          placeholderTextColor={currentTheme.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color={currentTheme.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredMachines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: currentTheme.primary + '10' }]}>
              <Icon name="construct" size={40} color={currentTheme.primary} />
            </View>
            <Text style={[styles.emptyText, { color: currentTheme.text }]}>Nenhuma máquina encontrada</Text>
            <Text style={[styles.emptySubtext, { color: currentTheme.textLight }]}>Adicione uma máquina e vincule-a a um cliente cadastrado</Text>
          </View>
        ) : (
          filteredMachines.map((machine) => (
            <TouchableOpacity
              key={machine.id}
              style={[styles.machineCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}
              onPress={() => {
                if (userRole === 'producer') {
                  navigation.navigate('ServiceRequest', { machine });
                } else {
                  navigation.navigate('MachineDetail', { machine });
                }
              }}
            >
              <View style={styles.machineHeader}>
                <View style={styles.machineInfo}>
                  <View style={styles.machineInfoRow}>
                    {machine.imageUrl ? (
                      <Image source={{ uri: machine.imageUrl }} style={styles.machineThumbnail} />
                    ) : (
                      <View style={[styles.machineThumbnailPlaceholder, { backgroundColor: currentTheme.border }]}>
                        <Icon name="image-outline" size={20} color={currentTheme.textLight} />
                      </View>
                    )}
                    <View style={styles.machineTextInfo}>
                      <Text style={[styles.machineName, { color: currentTheme.text }]}>{machine.name}</Text>
                      <Text style={[styles.machineModel, { color: currentTheme.textLight }]}>{machine.model}</Text>
                      {machine.categoryName && (
                        <View style={styles.categoryBadge}>
                          <Icon name="pricetag-outline" size={12} color={currentTheme.primary} />
                          <Text style={[styles.categoryText, { color: currentTheme.primary }]}>{machine.categoryName}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(machine.status) + '15', borderColor: getStatusColor(machine.status) + '30', borderWidth: 1 }]}> 
                  <Icon name={getStatusIcon(machine.status)} size={14} color={getStatusColor(machine.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(machine.status) }]}>{machine.status || 'Sem status'}</Text>
                </View>
              </View>
              
              <View style={styles.machineDetails}>
                <View style={styles.detailItem}>
                  <Icon name="person-outline" size={16} color={currentTheme.textLight} />
                  <Text style={[styles.detailText, { color: currentTheme.textLight }]}>{machine.operator || 'Sem operador'}</Text>
                </View>
                {machine.clientName && (
                  <View style={styles.detailItem}>
                    <Icon name="business-outline" size={16} color={currentTheme.textLight} />
                    <Text style={[styles.detailText, { color: currentTheme.textLight }]}>{machine.clientName}</Text>
                  </View>
                )}
                {machine.createdAt && (
                  <View style={styles.detailItem}>
                    <Icon name="calendar-outline" size={16} color={currentTheme.textLight} />
                    <Text style={[styles.detailText, { color: currentTheme.textLight }]}>
                      {new Date(machine.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.machineFooter}>
                <Text style={[styles.footerText, { color: currentTheme.textLight }]}>Ver detalhes</Text>
                <Icon name="chevron-forward" size={20} color={currentTheme.textLight} />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  machineCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  machineInfo: {
    flex: 1,
  },
  machineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 14,
    resizeMode: 'cover',
  },
  machineThumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  machineTextInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  machineModel: {
    fontSize: 13,
    marginBottom: 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  machineDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 6,
  },
  machineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorText: {
    fontSize: 13,
    marginLeft: 6,
  },
});

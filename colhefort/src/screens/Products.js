import React, { useContext, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function Products() {
  const { products } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'low_stock'
  const navigation = useNavigation();

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.includes(search);
    if (filterTab === 'low_stock') {
      return matchesSearch && p.stock < 10;
    }
    return matchesSearch;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ProductForm', { product: item })}
    >
      <View style={styles.cardHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={{width: 40, height: 40, borderRadius: 20, marginRight: 10}} />
          ) : (
            <View style={{width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center'}}>
              <Icon name="cube" size={20} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
        </View>
        {item.stock < 10 && (
          <View style={styles.alertBadge}>
            <Icon name="warning" size={12} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.alertText}>Baixo Estoque</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.productName}>{item.name}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Custo</Text>
          <Text style={styles.statValue}>R$ {item.cost.toFixed(2)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Venda</Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>R$ {item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Estoque</Text>
          <Text style={[styles.statValue, item.stock < 10 && { color: theme.colors.danger }]}>{item.stock} un</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Produtos</Text>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou código..."
            placeholderTextColor={theme.colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, filterTab === 'all' && styles.activeTab]}
          onPress={() => setFilterTab('all')}
        >
          <Text style={[styles.tabText, filterTab === 'all' && styles.activeTabText]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, filterTab === 'low_stock' && styles.activeTab]}
          onPress={() => setFilterTab('low_stock')}
        >
          <Text style={[styles.tabText, filterTab === 'low_stock' && styles.activeTabText]}>Baixo Estoque</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cube-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E8ECEF',
  },
  activeTab: {
    backgroundColor: theme.colors.secondary,
  },
  tabText: {
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  list: {
    padding: 15,
    paddingBottom: 80, // For FAB
  },
  productCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  codeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  alertText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
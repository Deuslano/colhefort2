import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

export default function More() {
  const navigation = useNavigation();
  const { userRole } = useContext(AppContext);

  const producerMenuItems = [
    { id: 1, title: 'Meus Serviços', icon: 'document-text-outline', screen: 'ProducerDashboard' },
    { id: 2, title: 'Relatórios', icon: 'bar-chart-outline', screen: 'FinancialReports' },
  ];

  const adminMenuItems = [
    { id: 100, title: 'Gerenciar Usuários', icon: 'people-outline', screen: 'UserManagement' },
  ];

  const managerMenuItems = [
    { id: 1, title: 'Clientes / Fazendas', icon: 'business-outline', screen: 'ClientsFarms' },
    { id: 2, title: 'Fornecedores', icon: 'cube-outline', screen: 'Suppliers' },
    { id: 3, title: 'Categorias', icon: 'list-outline', screen: 'Categories' },
    { id: 4, title: 'Ordens de Serviço', icon: 'document-text-outline', screen: 'ServiceOrders' },
    { id: 5, title: 'Despesas', icon: 'cash-outline', screen: 'Expenses' },
    { id: 6, title: 'Contas a Receber', icon: 'card-outline', screen: 'AccountsReceivable' },
    { id: 7, title: 'Fluxo de Caixa', icon: 'trending-up-outline', screen: 'CashFlow' },
    { id: 8, title: 'Relatórios Financeiros', icon: 'bar-chart-outline', screen: 'FinancialReports' },
  ];

  const adminFullMenuItems = [
    { id: 1, title: 'Clientes / Fazendas', icon: 'business-outline', screen: 'ClientsFarms' },
    { id: 2, title: 'Fornecedores', icon: 'cube-outline', screen: 'Suppliers' },
    { id: 3, title: 'Categorias', icon: 'list-outline', screen: 'Categories' },
    { id: 4, title: 'Ordens de Serviço', icon: 'document-text-outline', screen: 'ServiceOrders' },
    { id: 5, title: 'Despesas', icon: 'cash-outline', screen: 'Expenses' },
    { id: 6, title: 'Contas a Receber', icon: 'card-outline', screen: 'AccountsReceivable' },
    { id: 7, title: 'Fluxo de Caixa', icon: 'trending-up-outline', screen: 'CashFlow' },
    { id: 8, title: 'Relatórios Financeiros', icon: 'bar-chart-outline', screen: 'FinancialReports' },
  ];

  const filteredMenuItems = userRole === 'producer' 
    ? producerMenuItems 
    : userRole === 'admin' 
      ? [...adminMenuItems, ...adminFullMenuItems]
      : managerMenuItems;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mais</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredMenuItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu</Text>
            {filteredMenuItems.slice(0, 4).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredMenuItems.length > 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financeiro</Text>
            {filteredMenuItems.slice(4).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textLight,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
});

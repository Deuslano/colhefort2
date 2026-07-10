import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function FinancialReports() {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(AppContext);
  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const reports = [
    { id: 2, title: 'Fluxo de Caixa', icon: 'swap-horizontal-outline', description: 'Análise detalhada do fluxo financeiro', screen: 'CashFlow' },
    { id: 3, title: 'Contas a Receber', icon: 'card-outline', description: 'Relatório de contas a receber', screen: 'AccountsReceivable' },
    { id: 4, title: 'Contas a Pagar', icon: 'cash-outline', description: 'Relatório de contas a pagar', screen: 'Expenses' },
    { id: 11, title: 'Utilização de Máquinas', icon: 'stats-chart-outline', description: 'Relatório de uso das máquinas', screen: 'MachineUsageReport' },
    { id: 9, title: 'Alocações', icon: 'calendar-outline', description: 'Ver todas as alocações', screen: 'Allocations' },
    { id: 10, title: 'Máquinas', icon: 'construct-outline', description: 'Ver todas as máquinas', screen: 'Machines' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios Financeiros</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Relatórios Disponíveis</Text>
        
        {reports.map((report) => (
          <TouchableOpacity 
            key={report.id} 
            style={[styles.reportCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}
            onPress={() => navigation.navigate(report.screen)}
          >
            <View style={[styles.reportIcon, { backgroundColor: currentTheme.primary + '15' }]}>
              <Icon name={report.icon} size={24} color={currentTheme.primary} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={[styles.reportTitle, { color: currentTheme.text }]}>{report.title}</Text>
              <Text style={[styles.reportDescription, { color: currentTheme.textLight }]}>{report.description}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={currentTheme.textLight} />
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  reportIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 13,
  },
});

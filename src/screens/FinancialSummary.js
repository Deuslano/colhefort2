import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function FinancialSummary() {
  const navigation = useNavigation();
  const { expenses, accountsReceivable, cashFlowTransactions } = useContext(AppContext);
  const [selectedPeriod, setSelectedPeriod] = useState('Este Mês');
  
  const periods = ['Este Mês', 'Último Mês', 'Este Ano', 'Todos'];

  const financialData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filterByPeriod = (items) => {
      if (!items || items.length === 0) return [];
      if (selectedPeriod === 'Todos') return items;
      return items.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date.split('/').reverse().join('-'));
        if (selectedPeriod === 'Este Mês') {
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        } else if (selectedPeriod === 'Último Mês') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear;
        } else if (selectedPeriod === 'Este Ano') {
          return itemDate.getFullYear() === currentYear;
        }
        return true;
      });
    };

    const filteredExpenses = filterByPeriod(expenses);
    const filteredAccountsReceivable = filterByPeriod(accountsReceivable);
    const filteredCashFlow = filterByPeriod(cashFlowTransactions);

    const totalRevenue = filteredAccountsReceivable.reduce((sum, acc) => sum + (acc.amount || 0), 0) +
                          filteredCashFlow.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) +
                          filteredCashFlow.filter(t => t.type === 'outcome').reduce((sum, t) => sum + (t.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Calculate expense distribution from descriptions
    const expenseCategories = {};
    filteredExpenses.forEach(exp => {
      if (exp.description) {
        const category = exp.description.split(' - ')[0] || 'Outros';
        expenseCategories[category] = (expenseCategories[category] || 0) + (exp.amount || 0);
      }
    });

    const totalExpenseAmount = Object.values(expenseCategories).reduce((sum, val) => sum + val, 0);
    const expenseDistribution = Object.entries(expenseCategories).map(([category, value]) => ({
      category,
      value,
      percentage: totalExpenseAmount > 0 ? Math.round((value / totalExpenseAmount) * 100) : 0,
    }));

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      expenseDistribution,
    };
  }, [expenses, accountsReceivable, cashFlowTransactions, selectedPeriod]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resumo Financeiro</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.activePeriod]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodText, selectedPeriod === period && styles.activePeriodText]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Icon name="trending-up-outline" size={24} color={theme.colors.success} />
            <Text style={styles.summaryLabel}>Receitas Totais</Text>
            <Text style={styles.summaryValue}>R$ {financialData.totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="trending-down-outline" size={24} color={theme.colors.danger} />
            <Text style={styles.summaryLabel}>Despesas Totais</Text>
            <Text style={styles.summaryValue}>R$ {financialData.totalExpenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
          </View>
        </View>

        <View style={styles.profitCard}>
          <Icon name="wallet-outline" size={32} color={theme.colors.primary} />
          <View style={styles.profitInfo}>
            <Text style={styles.profitLabel}>Lucro Líquido</Text>
            <Text style={styles.profitValue}>R$ {financialData.netProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
          </View>
        </View>

        {/* Revenue Evolution Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Evolução das Receitas e Despesas</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
              datasets: [
                {
                  data: [financialData.totalRevenue * 0.8, financialData.totalRevenue * 0.9, financialData.totalRevenue * 0.7, financialData.totalRevenue * 0.85, financialData.totalRevenue * 0.95, financialData.totalRevenue],
                  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: [financialData.totalExpenses * 0.7, financialData.totalExpenses * 0.8, financialData.totalExpenses * 0.6, financialData.totalExpenses * 0.75, financialData.totalExpenses * 0.85, financialData.totalExpenses],
                  color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={Dimensions.get('window').width - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#fff',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {financialData.expenseDistribution.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Distribuição das Despesas</Text>
          <PieChart
            data={financialData.expenseDistribution.map((expense, index) => ({
              name: expense.category,
              population: expense.value,
              color: getExpenseColor(index),
              legendFontColor: '#333',
              legendFontSize: 12,
            }))}
            width={Dimensions.get('window').width - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
          
          <View style={styles.expenseList}>
            {financialData.expenseDistribution.map((expense, index) => (
              <View key={index} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <View style={[styles.expenseColor, { backgroundColor: getExpenseColor(index) }]} />
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>
                <View style={styles.expenseValues}>
                  <Text style={styles.expenseValue}>R$ {expense.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
                  <Text style={styles.expensePercentage}>{expense.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getExpenseColor = (index) => {
  const colors = ['#2E7D32', '#FFC107', '#D32F2F', '#1976D2'];
  return colors[index % colors.length];
};

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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  activePeriod: {
    backgroundColor: theme.colors.primary,
  },
  periodText: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
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
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profitInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profitLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  chartSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 8,
  },
  expenseList: {
    marginTop: 10,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  expenseCategory: {
    fontSize: 14,
    color: theme.colors.text,
  },
  expenseValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 12,
  },
  expensePercentage: {
    fontSize: 12,
    color: theme.colors.textLight,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

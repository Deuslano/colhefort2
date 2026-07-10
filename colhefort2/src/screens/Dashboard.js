import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function Dashboard() {
  const { currentUserDisplayName, expenses, accountsReceivable, machines, allocations, isDarkMode, userRole, currentUser } = useContext(AppContext);
  const navigation = useNavigation();

  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  }, []);

  const metrics = useMemo(() => {
    // Filter allocations for producer
    const userAllocations = userRole === 'producer' 
      ? allocations.filter(a => a.clientId === currentUser?.uid)
      : allocations;
    
    const totalRevenue = accountsReceivable
      .filter(acc => acc.status === 'Recebido')
      .reduce((sum, acc) => sum + Number(acc.amount || 0), 0);
    const totalExpenses = expenses
      .filter(exp => exp.status === 'Pago')
      .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const cashFlow = totalRevenue - totalExpenses;
    const allocatedMachines = userAllocations.filter((allocation) => allocation.status === 'Em andamento').length;
    const pendingAllocations = userAllocations.filter((allocation) => allocation.approvalStatus === 'pending').length;
    const approvedAllocations = userAllocations.filter((allocation) => allocation.approvalStatus === 'approved').length;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      cashFlow,
      allocatedMachines,
      pendingAllocations,
      approvedAllocations,
    };
  }, [expenses, accountsReceivable, allocations, userRole, currentUser]);

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLogo}>
              <Icon name="leaf" size={28} color={theme.colors.secondary} style={styles.headerLogoIcon} />
              <View>
                <Text style={styles.logoText}>COLHEFORT</Text>
                <Text style={styles.subLogoText}>Alocação de Máquinas Agrícolas</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
              <View style={[styles.profileCircle, { backgroundColor: currentTheme.primary + '30' }]}>
                <Icon name="person" size={20} color={theme.colors.secondary} />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Olá, {currentUserDisplayName}!</Text>
            <Text style={styles.welcomeMessage}>Bem-vindo de volta ao sistema</Text>
          </View>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Metrics Grid - Show different metrics based on role */}
          {userRole === 'producer' ? (
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.warning + '20', borderWidth: 1 }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: currentTheme.warning + '15' }]}>
                  <Icon name="time" size={20} color={currentTheme.warning} />
                </View>
                <Text style={[styles.metricLabel, { color: currentTheme.textLight }]}>Pendentes</Text>
                <Text style={[styles.metricValue, { color: currentTheme.text }]}>{metrics.pendingAllocations}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.success + '20', borderWidth: 1 }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: currentTheme.success + '15' }]}>
                  <Icon name="checkmark-circle" size={20} color={currentTheme.success} />
                </View>
                <Text style={[styles.metricLabel, { color: currentTheme.textLight }]}>Aprovadas</Text>
                <Text style={[styles.metricValue, { color: currentTheme.success }]}>{metrics.approvedAllocations}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.primary + '20', borderWidth: 1 }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: currentTheme.primary + '15' }]}>
                  <Icon name="leaf" size={20} color={currentTheme.primary} />
                </View>
                <Text style={[styles.metricLabel, { color: currentTheme.textLight }]}>Em Andamento</Text>
                <Text style={[styles.metricValue, { color: currentTheme.primary }]}>{metrics.allocatedMachines}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.success + '20', borderWidth: 1 }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: currentTheme.success + '15' }]}>
                  <Icon name="trending-up" size={20} color={currentTheme.success} />
                </View>
                <Text style={[styles.metricLabel, { color: currentTheme.textLight }]}>Receitas Totais</Text>
                <Text style={[styles.metricValue, { color: currentTheme.text }]}>R$ {metrics.totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.danger + '20', borderWidth: 1 }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: currentTheme.danger + '15' }]}>
                  <Icon name="trending-down" size={20} color={currentTheme.danger} />
                </View>
                <Text style={[styles.metricLabel, { color: currentTheme.textLight }]}>Despesas Totais</Text>
                <Text style={[styles.metricValue, { color: currentTheme.text }]}>R$ {metrics.totalExpenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.primary + '20', borderWidth: 1 }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: currentTheme.primary + '15' }]}>
                  <Icon name="wallet" size={20} color={currentTheme.primary} />
                </View>
                <Text style={[styles.metricLabel, { color: currentTheme.textLight }]}>Lucro Líquido</Text>
                <Text style={[styles.metricValue, { color: currentTheme.primary }]}>R$ {metrics.netProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: currentTheme.card, borderColor: theme.colors.secondary + '20', borderWidth: 1 }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                  <Icon name="swap-horizontal" size={20} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.metricLabel, { color: currentTheme.textLight }]}>Fluxo de Caixa</Text>
                <Text style={[styles.metricValue, { color: theme.colors.secondary }]}>R$ {metrics.cashFlow.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</Text>
              </View>
            </View>
          )}

          {/* Allocated Machines Card */}
          <View style={[styles.allocatedCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
            <View style={styles.allocatedHeader}>
              <View style={[styles.allocatedIconContainer, { backgroundColor: currentTheme.primary + '15' }]}>
                <Icon name="leaf" size={24} color={currentTheme.primary} />
              </View>
              <View style={styles.allocatedInfo}>
                <Text style={[styles.allocatedLabel, { color: currentTheme.text }]}>Máquinas Alocadas</Text>
                <Text style={[styles.allocatedValue, { color: currentTheme.textLight }]}>{metrics.allocatedMachines} máquinas em operação</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.allocatedButton, { backgroundColor: currentTheme.primary + '10' }]}
              onPress={() => userRole === 'producer' ? navigation.navigate('MyAllocations') : navigation.navigate('Alocações')}
            >
              <Text style={[styles.allocatedButtonText, { color: currentTheme.primary }]}>
                {userRole === 'producer' ? 'Ver Minhas Alocações' : 'Ver Alocações'}
              </Text>
              <Icon name="chevron-forward" size={20} color={currentTheme.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions - Different for producers */}
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Ações rápidas</Text>
          <View style={styles.actionsRow}>
            {userRole === 'producer' ? (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Máquinas')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="leaf" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Máquinas</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Allocations')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="calendar" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Minhas Alocações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ServiceRequest')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="add-circle" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Solicitar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ProducerDashboard')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="document-text" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Serviços</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Máquinas')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="leaf" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Máquinas</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Alocações')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="calendar" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Alocações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('FinancialReports')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="bar-chart" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Relatórios</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ClientsFarms')}>
                  <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '30', borderWidth: 1 }]}>
                    <Icon name="people" size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>Clientes</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  header: { 
    padding: 24, 
    paddingTop: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoIcon: {
    marginRight: 12,
  },
  logoText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: theme.colors.secondary,
    letterSpacing: 1.5,
  },
  subLogoText: {
    fontSize: 11,
    color: theme.colors.secondary + 'CC',
    letterSpacing: 0.5,
  },
  greetingContainer: {
    marginTop: 8,
  },
  greeting: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#fff',
  },
  welcomeMessage: { 
    fontSize: 14, 
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    marginTop: -30,
  },
  metricsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
  },
  metricCard: { 
    width: '48%', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
  metricValue: { fontSize: 16, fontWeight: 'bold' },
  allocatedCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  allocatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  allocatedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  allocatedInfo: {
    flex: 1,
  },
  allocatedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  allocatedValue: {
    fontSize: 13,
  },
  allocatedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  allocatedButtonText: {
    fontWeight: '600',
    fontSize: 15,
    marginRight: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 4 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: { 
    width: '23%', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  iconCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: { fontSize: 12, textAlign: 'center', fontWeight: '600' },
  iconCircleBg: {
    backgroundColor: theme.colors.primary,
  }
});

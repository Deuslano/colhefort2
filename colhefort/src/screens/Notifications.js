import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function Notifications() {
  const { consortiums, invoices } = useContext(AppContext);
  const navigation = useNavigation();

  const notifications = useMemo(() => {
    const alerts = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const today = now.getDate();

    // 1. Verificar Invoices (Faturas) a vencer
    invoices.forEach(invoice => {
      if (invoice.status === 'pending') {
        const dueDate = new Date(invoice.dueDate);
        // Calcula a diferença em dias ignorando horas
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          alerts.push({
            id: `inv_late_${invoice.id}`,
            type: 'danger',
            icon: 'alert-circle',
            title: 'Fatura Atrasada',
            message: `A fatura "${invoice.description}" de R$ ${invoice.value.toFixed(2)} venceu há ${Math.abs(diffDays)} dia(s).`,
            action: () => navigation.navigate('Financeiro')
          });
        } else if (diffDays === 0) {
          alerts.push({
            id: `inv_today_${invoice.id}`,
            type: 'warning',
            icon: 'warning',
            title: 'Fatura vence HOJE',
            message: `A fatura "${invoice.description}" de R$ ${invoice.value.toFixed(2)} vence hoje!`,
            action: () => navigation.navigate('Financeiro')
          });
        } else if (diffDays <= 3) {
          alerts.push({
            id: `inv_soon_${invoice.id}`,
            type: 'info',
            icon: 'calendar',
            title: 'Fatura próxima do vencimento',
            message: `A fatura "${invoice.description}" vence em ${diffDays} dia(s).`,
            action: () => navigation.navigate('Financeiro')
          });
        }
      }
    });

    // 2. Verificar Consórcios (Sorteio próximo e inadimplentes)
    consortiums.forEach(consortium => {
      const drawDay = consortium.drawDay || 15;
      const daysUntilDraw = drawDay - today;

      // Se faltam 3 dias ou menos para o sorteio, ou se o dia já chegou/passou neste mês
      if (daysUntilDraw <= 3) {
        const unpaidParticipants = consortium.participants.filter(p => {
          if (p.hasWon) return false;
          if (!p.payments) return true;
          return !p.payments.some(pay => pay.month === currentMonth && pay.year === currentYear);
        });

        if (unpaidParticipants.length > 0) {
          const isLate = daysUntilDraw < 0;
          alerts.push({
            id: `cons_${consortium.id}`,
            type: isLate ? 'danger' : 'warning',
            icon: 'people',
            title: `Pendências no Consórcio ${consortium.name}`,
            message: `Falta${unpaidParticipants.length > 1 ? 'm' : ''} ${unpaidParticipants.length} participante(s) pagar a mensalidade deste mês. ${isLate ? 'O dia do sorteio já passou!' : `O sorteio é dia ${drawDay}.`}`,
            action: () => navigation.navigate('Consórcios', { screen: 'ConsortiumDetail', params: { consortium } })
          });
        }
      }
    });

    return alerts;
  }, [consortiums, invoices]);

  const renderItem = ({ item }) => {
    let bgColor, iconColor;
    switch(item.type) {
      case 'danger': bgColor = '#FDECEC'; iconColor = theme.colors.danger; break;
      case 'warning': bgColor = '#FFF4E5'; iconColor = theme.colors.warning; break;
      default: bgColor = '#EEF3FF'; iconColor = theme.colors.primary; break;
    }

    return (
      <TouchableOpacity style={[styles.notificationCard, { borderLeftColor: iconColor }]} onPress={item.action}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon name={item.icon} size={24} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="checkmark-circle-outline" size={60} color={theme.colors.success} />
            <Text style={styles.emptyText}>Tudo em dia!</Text>
            <Text style={styles.emptySubText}>Você não tem notificações pendentes.</Text>
          </View>
        }
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 15,
    color: theme.colors.textLight,
  },
});

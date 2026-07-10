import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ClientDetail() {
  const { clients, sales, invoices, consortiums } = useContext(AppContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { clientId } = route.params;

  const client = clients.find(c => c.id === clientId);

  const clientSales = useMemo(() => sales.filter(s => s.clientId === clientId).sort((a,b) => b.id - a.id), [sales, clientId]);
  const clientInvoices = useMemo(() => {
    // Invoices are linked to sales, which are linked to clients
    // Or we can just filter invoices where description contains client name if we don't have clientId on invoice
    // We added clientName to description, but better if we had clientId
    // For now we'll match by saleId if sale exists
    const saleIds = clientSales.map(s => s.id);
    return invoices.filter(i => saleIds.includes(i.saleId)).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [invoices, clientSales]);

  const clientConsortiums = useMemo(() => {
    return consortiums.filter(c => c.participants && c.participants.some(p => p.name.toLowerCase() === client?.name.toLowerCase()));
  }, [consortiums, client]);

  if (!client) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{textAlign: 'center', marginTop: 50}}>Cliente não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const renderSale = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyIcon}>
        <Icon name="cart" size={20} color={theme.colors.secondary} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>Venda - {item.date}</Text>
        <Text style={styles.historySub}>{item.paymentType === 'prazo' ? `${item.installments}x Parcelado` : 'À Vista'}</Text>
      </View>
      <Text style={styles.historyAmount}>R$ {item.total.toFixed(2)}</Text>
    </View>
  );

  const renderInvoice = ({ item }) => {
    const isPaid = item.status === 'paid';
    return (
      <View style={styles.historyCard}>
        <View style={[styles.historyIcon, { backgroundColor: isPaid ? theme.colors.success : theme.colors.danger }]}>
          <Icon name={isPaid ? "checkmark" : "time"} size={20} color="#fff" />
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle}>{item.description}</Text>
          <Text style={styles.historySub}>Venc: {item.dueDate}</Text>
        </View>
        <Text style={styles.historyAmount}>R$ {item.value.toFixed(2)}</Text>
      </View>
    );
  };

  const renderConsortium = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={[styles.historyIcon, { backgroundColor: theme.colors.primary }]}>
        <Icon name="flower" size={20} color="#fff" />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{item.name}</Text>
        <Text style={styles.historySub}>Sorteio dia {item.drawDay || 15}</Text>
      </View>
      <Text style={styles.historyAmount}>R$ {item.monthlyValue.toFixed(2)}/mês</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil do Cliente</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarTextBig}>{client.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.clientName}>{client.name}</Text>
          {client.phone ? <Text style={styles.clientPhone}><Icon name="logo-whatsapp" size={14}/> {client.phone}</Text> : null}
          {client.notes ? <Text style={styles.clientNotes}>{client.notes}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faturas</Text>
          {clientInvoices.length > 0 ? (
            clientInvoices.map(i => <React.Fragment key={i.id}>{renderInvoice({item: i})}</React.Fragment>)
          ) : (
            <Text style={styles.emptyText}>Nenhuma fatura.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Compras</Text>
          {clientSales.length > 0 ? (
            clientSales.map(s => <React.Fragment key={s.id}>{renderSale({item: s})}</React.Fragment>)
          ) : (
            <Text style={styles.emptyText}>Nenhuma compra registrada.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consórcios</Text>
          {clientConsortiums.length > 0 ? (
            clientConsortiums.map(c => <React.Fragment key={c.id}>{renderConsortium({item: c})}</React.Fragment>)
          ) : (
            <Text style={styles.emptyText}>Não participa de consórcios.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backButton: { padding: 5 },
  container: { flex: 1 },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarTextBig: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  clientName: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  clientPhone: { fontSize: 16, color: theme.colors.textLight, marginTop: 5 },
  clientNotes: { fontSize: 14, color: theme.colors.textLight, marginTop: 15, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 20 },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
  historySub: { fontSize: 12, color: theme.colors.textLight, marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
  emptyText: { fontSize: 14, color: theme.colors.textLight, fontStyle: 'italic' },
});

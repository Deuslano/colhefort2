import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function Settings() {
  const navigation = useNavigation();
  const { isDarkMode, toggleDarkMode } = useContext(AppContext);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-back" size={24} color={theme.colors.secondary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.cardTitle, { color: currentTheme.primary }]}>Preferências</Text>
          <View style={styles.row}><Text style={[styles.label, { color: currentTheme.text }]}>Notificações</Text><Switch value={notifications} onValueChange={setNotifications} /></View>
          <View style={styles.row}><Text style={[styles.label, { color: currentTheme.text }]}>Sincronização automática</Text><Switch value={autoSync} onValueChange={setAutoSync} /></View>
          <View style={styles.row}><Text style={[styles.label, { color: currentTheme.text }]}>Modo escuro</Text><Switch value={isDarkMode} onValueChange={toggleDarkMode} /></View>
        </View>

        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.cardTitle, { color: currentTheme.primary }]}>Empresa</Text>
          <Text style={[styles.infoText, { color: currentTheme.textLight }]}>Nome: AgroFrota</Text>
          <Text style={[styles.infoText, { color: currentTheme.textLight }]}>Versão: 1.0.0</Text>
          <Text style={[styles.infoText, { color: currentTheme.textLight }]}>Última sincronização: Hoje às 08:00</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary },
  container: { flex: 1, padding: 20 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontSize: 14 },
  infoText: { fontSize: 14, marginBottom: 6 },
});

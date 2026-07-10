import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppTheme as theme } from '../theme';

export default function Help() {
  const navigation = useNavigation();

  const supportOptions = [
    { title: 'WhatsApp', icon: 'logo-whatsapp', value: 'Enviar mensagem' },
    { title: 'E-mail', icon: 'mail-outline', value: 'suporte@agrofrota.com' },
    { title: 'Telefone', icon: 'call-outline', value: '(11) 99999-9999' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-back" size={24} color={theme.colors.secondary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Ajuda / Suporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Como usar</Text>
          <Text style={styles.infoText}>Cadastre máquinas, crie alocações com valor e acompanhe despesas e fluxo de caixa pelo painel.</Text>
        </View>

        {supportOptions.map((item) => (
          <TouchableOpacity key={item.title} style={styles.card} onPress={() => Linking.openURL('mailto:suporte@agrofrota.com')}>
            <View style={styles.row}>
              <Icon name={item.icon} size={22} color={theme.colors.primary} />
              <View style={styles.textGroup}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionValue}>{item.value}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: theme.colors.primary },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary },
  container: { flex: 1, padding: 20 },
  card: { backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 },
  infoText: { fontSize: 14, color: theme.colors.textLight, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  textGroup: { marginLeft: 12 },
  optionTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
  optionValue: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
});

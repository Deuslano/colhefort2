import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppTheme as theme } from '../theme';

export default function SystemParams() {
  const navigation = useNavigation();
  const [companyName, setCompanyName] = useState('AgroFrota');
  const [rentalRate, setRentalRate] = useState('250');
  const [taxPercent, setTaxPercent] = useState('10');
  const [currency, setCurrency] = useState('BRL');

  const handleSave = () => {
    Alert.alert('Sucesso', 'Parâmetros salvos.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-back" size={24} color={theme.colors.secondary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Parâmetros do Sistema</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuração geral</Text>
          <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Nome da empresa" />
          <TextInput style={styles.input} value={rentalRate} onChangeText={setRentalRate} placeholder="Valor padrão do aluguel" keyboardType="decimal-pad" />
          <TextInput style={styles.input} value={taxPercent} onChangeText={setTaxPercent} placeholder="% de imposto" keyboardType="decimal-pad" />
          <TextInput style={styles.input} value={currency} onChangeText={setCurrency} placeholder="Moeda" />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
        </View>
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
  card: { backgroundColor: theme.colors.card, borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, fontSize: 16, backgroundColor: '#fff', color: theme.colors.text },
  saveButton: { marginTop: 6, backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});

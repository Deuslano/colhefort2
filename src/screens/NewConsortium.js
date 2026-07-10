import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppTheme as theme } from '../theme';
import { AppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

export default function NewConsortium() {
  const [name, setName] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [prizeValue, setPrizeValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [drawDay, setDrawDay] = useState('15');

  const handleDateChange = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    let match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (match) {
      let result = match[1];
      if (match[2]) result += '/' + match[2];
      if (match[3]) result += '/' + match[3];
      setStartDate(result);
    } else {
      setStartDate(text);
    }
  };

  const { addConsortium } = useContext(AppContext);
  const navigation = useNavigation();

  const handleSave = () => {
    if (!name || !monthlyValue || !startDate) {
      Alert.alert('Erro', 'Por favor, preencha o nome, valor mensal e data de início.');
      return;
    }

    const newConsortium = {
      name,
      monthlyValue: parseFloat(monthlyValue.replace(',', '.')),
      prizeValue: prizeValue ? parseFloat(prizeValue.replace(',', '.')) : null,
      durationMonths: parseInt(durationMonths, 10) || 12,
      startDate,
      drawDay: parseInt(drawDay, 10) || 15,
      participants: [],
    };

    addConsortium(newConsortium);
    Alert.alert('Sucesso', 'Consórcio criado com sucesso! Agora adicione os participantes.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Consórcio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações do Grupo</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Consórcio</Text>
            <View style={styles.inputContainer}>
              <Icon name="flower-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Consórcio Verão 2026"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Valor Mensal (R$)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="50,00"
                  keyboardType="numeric"
                  value={monthlyValue}
                  onChangeText={setMonthlyValue}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Duração (meses)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="12"
                  keyboardType="numeric"
                  value={durationMonths}
                  onChangeText={setDurationMonths}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor Fixo do Prêmio (Opcional)</Text>
            <View style={styles.inputContainer}>
              <Icon name="gift-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Calculado auto se vazio"
                value={prizeValue}
                onChangeText={setPrizeValue}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={{fontSize: 12, color: theme.colors.textLight, marginTop: 4}}>
              Deixe em branco para o padrão (Valor Mensal x Duração).
            </Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Data de Início</Text>
              <View style={styles.inputContainer}>
                <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={startDate}
                  onChangeText={handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Dia do Sorteio</Text>
              <View style={styles.inputContainer}>
                <Icon name="gift-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 15"
                  keyboardType="numeric"
                  value={drawDay}
                  onChangeText={setDrawDay}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={22} color={theme.colors.primary} style={{ marginRight: 10 }} />
          <Text style={styles.infoText}>
            Após criar o consórcio, acesse-o na lista para adicionar participantes.
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Icon name="checkmark-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Criar Consórcio</Text>
        </TouchableOpacity>

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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: theme.colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF3FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

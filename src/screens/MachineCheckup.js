import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MachineCheckup() {
  const navigation = useNavigation();
  const route = useRoute();
  const { allocation, machine } = route.params || {};
  const { userRole } = useContext(AppContext);
  
  const [checkupData, setCheckupData] = useState({
    condition: '',
    fuelLevel: '',
    hoursUsed: '',
    observations: '',
    photos: [],
  });

  const conditionOptions = ['Excelente', 'Bom', 'Regular', 'Precisa de manutenção'];

  if (userRole !== 'operator' && userRole !== 'admin' && userRole !== 'manager') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Icon name="lock-closed" size={64} color={theme.colors.textLight} />
          <Text style={styles.message}>Acesso restrito</Text>
          <Text style={styles.subMessage}>Apenas operadores podem fazer check-up de máquinas.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    if (!checkupData.condition || !checkupData.fuelLevel || !checkupData.hoursUsed) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    Alert.alert('Sucesso', 'Check-up registrado com sucesso!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-up de Máquina</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Machine Info Card */}
        {machine && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="construct" size={24} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>{machine.name}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{machine.model}</Text>
            {machine.imageUrl && (
              <Image source={{ uri: machine.imageUrl }} style={styles.machineImage} />
            )}
          </View>
        )}

        {/* Allocation Info */}
        {allocation && (
          <View style={styles.infoCard}>
            <Icon name="calendar" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>{allocation.clientName}</Text>
            </View>
          </View>
        )}

        {/* Checkup Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Condição da Máquina</Text>
          <View style={styles.conditionGrid}>
            {conditionOptions.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[styles.conditionOption, checkupData.condition === condition && styles.selectedCondition]}
                onPress={() => setCheckupData({ ...checkupData, condition })}
              >
                <Text style={[styles.conditionText, checkupData.condition === condition && styles.selectedConditionText]}>
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nível de Combustível</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 75%"
            placeholderTextColor={theme.colors.textLight}
            value={checkupData.fuelLevel}
            onChangeText={(text) => setCheckupData({ ...checkupData, fuelLevel: text })}
          />

          <Text style={styles.label}>Horas de Uso</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 120 horas"
            placeholderTextColor={theme.colors.textLight}
            value={checkupData.hoursUsed}
            onChangeText={(text) => setCheckupData({ ...checkupData, hoursUsed: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva qualquer problema ou observação..."
            placeholderTextColor={theme.colors.textLight}
            value={checkupData.observations}
            onChangeText={(text) => setCheckupData({ ...checkupData, observations: text })}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Icon name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Registrar Check-up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Este check-up será registrado no histórico da máquina e ficará disponível para futuras referências.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 12,
  },
  machineImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  conditionOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCondition: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  conditionText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  selectedConditionText: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
  },
  subMessage: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});

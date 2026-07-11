import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { updatePassword } from 'firebase/auth';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

export default function FirstLoginPassword() {
  const navigation = useNavigation();
  const { currentUser, isDarkMode } = useContext(AppContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const handlePasswordChange = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // Atualizar senha no Firebase Auth
      await updatePassword(currentUser, newPassword);

      // Remover flag de primeiro acesso no Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          isFirstLogin: false,
          passwordChangedAt: new Date().toISOString(),
        });
      }

      Alert.alert(
        'Sucesso',
        'Senha alterada com sucesso! Você já pode acessar o sistema.',
        [{ text: 'OK', onPress: () => navigation.replace('Home') }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
      console.error('Erro ao alterar senha:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
          <Icon name="lock-closed" size={48} color={theme.colors.secondary} />
        </View>
        <Text style={styles.headerTitle}>Primeiro Acesso</Text>
        <Text style={styles.headerSubtitle}>Crie sua senha para continuar</Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}>
        <Text style={[styles.instructionText, { color: currentTheme.text }]}>
          Esta é sua primeira vez acessando o sistema. Por favor, crie uma nova senha para sua conta.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textLight }]}>Nova Senha</Text>
          <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
            <Icon name="lock-closed-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={currentTheme.textLight}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.textLight }]}>Confirmar Senha</Text>
          <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
            <Icon name="lock-closed-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder="Digite a senha novamente"
              placeholderTextColor={currentTheme.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.changeButton, { backgroundColor: currentTheme.primary }]}
          onPress={handlePasswordChange}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Alterar Senha</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
          <Text style={[styles.logoutButtonText, { color: currentTheme.textLight }]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 70,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.secondary + 'CC',
    textAlign: 'center',
  },
  formContainer: {
    padding: 32,
    marginTop: -32,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  changeButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  changeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

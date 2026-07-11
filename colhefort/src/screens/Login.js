import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useAlert } from '../components/CustomAlert';

export default function Login() {
  const navigation = useNavigation();
  const { login, registerUser, isAuthLoaded, isDarkMode } = useContext(AppContext);
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Producer registration fields
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [cep, setCep] = useState('');

  const currentTheme = isDarkMode ? theme.dark : theme.colors;

  const maskCpf = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskCep = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    if (isRegistering) {
      // Validate producer fields
      if (!name.trim() || !cpf.trim() || !farmName.trim() || !farmAddress.trim() || !cep.trim()) {
        showAlert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      if (cpf.replace(/\D/g, '').length !== 11) {
        showAlert('Erro', 'CPF inválido. Digite 11 números.');
        setLoading(false);
        return;
      }

      const result = await registerUser(email, password, 'producer', name, {
        cpf,
        farmName,
        farmAddress,
        cep,
      });
      setLoading(false);
      if (result.success) {
        showAlert('Sucesso', 'Conta criada! Você já pode fazer login.');
        setIsRegistering(false);
        // Clear form
        setName('');
        setCpf('');
        setFarmName('');
        setFarmAddress('');
        setCep('');
      } else {
        showAlert('Erro', result.error || 'Não foi possível criar a conta.');
      }
    } else {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) {
        // Navigation is handled automatically by AppNavigator based on auth state
      } else {
        showAlert('Erro', result.error || 'E-mail ou senha inválidos.');
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={[styles.logoContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
          <Icon name="leaf" size={48} color={theme.colors.secondary} />
        </View>
        <Text style={styles.logoText}>COLHEFORT</Text>
        <Text style={styles.subLogoText}>Alocação de Máquinas Agrícolas</Text>
      </View>
      
      <View style={[styles.formContainer, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{isRegistering ? 'Cadastro de Produtor' : 'Bem-vindo(a)'}</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textLight }]}>
          {isRegistering ? 'Preencha seus dados para solicitar serviços' : 'Faça login para continuar'}
        </Text>

        {isRegistering && (
          <>
            <View style={styles.sectionDivider}>
              <Text style={[styles.sectionLabel, { color: currentTheme.primary }]}>Dados Pessoais</Text>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
              <Icon name="person-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: currentTheme.text }]}
                placeholder="Nome completo"
                placeholderTextColor={currentTheme.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
              <Icon name="card-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: currentTheme.text }]}
                placeholder="CPF"
                placeholderTextColor={currentTheme.textLight}
                value={cpf}
                onChangeText={(text) => setCpf(maskCpf(text))}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>

            <View style={styles.sectionDivider}>
              <Text style={[styles.sectionLabel, { color: currentTheme.primary }]}>Dados da Fazenda</Text>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
              <Icon name="home-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: currentTheme.text }]}
                placeholder="Nome da fazenda"
                placeholderTextColor={currentTheme.textLight}
                value={farmName}
                onChangeText={setFarmName}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
              <Icon name="location-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: currentTheme.text }]}
                placeholder="Endereço da fazenda"
                placeholderTextColor={currentTheme.textLight}
                value={farmAddress}
                onChangeText={setFarmAddress}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
              <Icon name="map-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: currentTheme.text }]}
                placeholder="CEP"
                placeholderTextColor={currentTheme.textLight}
                value={cep}
                onChangeText={(text) => setCep(maskCep(text))}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>

            <View style={styles.sectionDivider}>
              <Text style={[styles.sectionLabel, { color: currentTheme.primary }]}>Dados de Acesso</Text>
            </View>
          </>
        )}

        <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
          <Icon name="mail-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: currentTheme.text }]}
            placeholder="E-mail"
            placeholderTextColor={currentTheme.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}>
          <Icon name="lock-closed-outline" size={20} color={currentTheme.textLight} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: currentTheme.text }]}
            placeholder="Senha"
            placeholderTextColor={currentTheme.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={[styles.loginButton, { backgroundColor: currentTheme.primary }]} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>{isRegistering ? 'Cadastrar' : 'Entrar'}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerButton} onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={[styles.registerButtonText, { color: currentTheme.primary }]}>
            {isRegistering ? 'Já tenho uma conta. Fazer Login' : 'Sou produtor. Quero me cadastrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 70,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    letterSpacing: 2.5,
  },
  subLogoText: {
    fontSize: 13,
    color: theme.colors.secondary + 'CC',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 4,
  },
  formContainer: {
    padding: 32,
    marginTop: -32,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 28,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
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
  loginButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerButton: {
    marginTop: 20,
    padding: 12,
  },
  registerButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

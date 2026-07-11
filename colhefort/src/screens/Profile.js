import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useAlert } from '../components/CustomAlert';

export default function Profile() {
  const { currentUser, logout } = useContext(AppContext);
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  const handleLogout = () => {
    showAlert('Sair da Conta', 'Tem certeza que deseja sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: () => logout()
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={50} color={theme.colors.primary} />
          </View>
          <Text style={styles.userName}>{currentUser?.displayName || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{currentUser?.email || 'Usuário'}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Sincronizado na Nuvem</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out-outline" size={24} color={theme.colors.danger} style={{marginRight: 8}} />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  profileCard: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginBottom: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  badgeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    width: '100%',
    marginTop: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.danger,
    fontSize: 18,
    fontWeight: 'bold',
  }
});

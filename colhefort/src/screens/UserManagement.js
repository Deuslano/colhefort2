import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const roles = [
  { id: 'admin', name: 'Administrador', icon: 'shield-checkmark', description: 'Acesso total ao sistema' },
  { id: 'manager', name: 'Gerente', icon: 'people-outline', description: 'Gerencia usuários e alocações' },
  { id: 'operator', name: 'Operador', icon: 'construct-outline', description: 'Entrega máquinas e faz check-up' },
  { id: 'producer', name: 'Produtor', icon: 'leaf-outline', description: 'Solicita serviços' },
];

const permissions = {
  admin: ['users', 'machines', 'allocations', 'reports', 'checkup', 'all'],
  manager: ['machines', 'allocations', 'reports', 'checkup'],
  operator: ['machines', 'checkup'],
  producer: ['allocations', 'reports'],
};

export default function UserManagement() {
  const navigation = useNavigation();
  const { registerUser, userRole, currentUser } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('producer');
  const [loading, setLoading] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [selectedRoleInfo, setSelectedRoleInfo] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users list
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setUsersList(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (userEmail === 'colhefort@gmail.com') {
      Alert.alert('Erro', 'Não é possível excluir o administrador principal.');
      return;
    }
    
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert('Sucesso', 'Usuário excluído com sucesso.');
              loadUsers();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o usuário.');
            }
          }
        }
      ]
    );
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      Alert.alert('Sucesso', 'Função do usuário atualizada.');
      loadUsers();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a função.');
    }
  };

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Icon name="lock-closed" size={64} color={theme.colors.textLight} />
          <Text style={styles.message}>Acesso restrito</Text>
          <Text style={styles.subMessage}>Apenas administradores podem acessar esta tela.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const result = await registerUser(email, password, role, name);
    setLoading(false);

    if (result.success) {
      Alert.alert('Sucesso', 'Usuário criado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      loadUsers();
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível criar o usuário.');
    }
  };

  const getRoleIcon = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.icon || 'person-outline';
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  const showRoleDetails = (roleItem) => {
    setSelectedRoleInfo(roleItem);
    setShowRoleInfo(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Users List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Usuários Cadastrados ({usersList.length})</Text>
          {loadingUsers ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <FlatList
              data={usersList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <View style={styles.userInfo}>
                    <View style={[styles.userAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Icon name={getRoleIcon(item.role)} size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name || 'Sem nome'}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                      <View style={styles.userRoleBadge}>
                        <Text style={styles.userRoleText}>{getRoleName(item.role)}</Text>
                      </View>
                    </View>
                  </View>
                  {item.email !== 'colhefort@gmail.com' && (
                    <View style={styles.userActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleChangeRole(item.id, item.role === 'producer' ? 'manager' : 'producer')}
                      >
                        <Icon name="swap-horizontal" size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteUser(item.id, item.email)}
                      >
                        <Icon name="trash" size={20} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Create User Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cadastrar Novo Usuário</Text>
          <Text style={styles.cardDescription}>Crie contas com diferentes níveis de acesso.</Text>

          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={theme.colors.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha (mínimo 6 caracteres)"
              placeholderTextColor={theme.colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.label}>Tipo de Usuário</Text>
          <View style={styles.roleGrid}>
            {roles.map((roleItem) => (
              <TouchableOpacity
                key={roleItem.id}
                style={[styles.roleCard, role === roleItem.id && styles.selectedRoleCard]}
                onPress={() => setRole(roleItem.id)}
                onLongPress={() => showRoleDetails(roleItem)}
              >
                <Icon 
                  name={roleItem.icon} 
                  size={24} 
                  color={role === roleItem.id ? '#fff' : theme.colors.primary} 
                />
                <Text style={[styles.roleCardTitle, role === roleItem.id && styles.selectedRoleText]}>
                  {roleItem.name}
                </Text>
                <TouchableOpacity onPress={() => showRoleDetails(roleItem)} style={styles.infoButton}>
                  <Icon name="information-circle" size={16} color={theme.colors.textLight} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Criar Usuário</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Toque e segure em um tipo de usuário para ver detalhes das permissões. Operadores podem fazer check-up de máquinas após a entrega.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showRoleInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name={selectedRoleInfo?.icon} size={32} color={theme.colors.primary} />
              <Text style={styles.modalTitle}>{selectedRoleInfo?.name}</Text>
            </View>
            <Text style={styles.modalDescription}>{selectedRoleInfo?.description}</Text>
            
            <Text style={styles.modalSectionTitle}>Permissões:</Text>
            <View style={styles.permissionsList}>
              {permissions[selectedRoleInfo?.id]?.map((perm) => (
                <View key={perm} style={styles.permissionItem}>
                  <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.permissionText}>{getPermissionLabel(perm)}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowRoleInfo(false)}>
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getPermissionLabel = (perm) => {
  const labels = {
    users: 'Gerenciar usuários',
    machines: 'Gerenciar máquinas',
    allocations: 'Gerenciar alocações',
    reports: 'Ver relatórios',
    checkup: 'Fazer check-up de máquinas',
    all: 'Acesso total',
  };
  return labels[perm] || perm;
};

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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
    marginTop: 10,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  roleCard: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginRight: '4%',
    marginBottom: 10,
  },
  selectedRoleCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedRoleText: {
    color: '#fff',
  },
  infoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 15,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  permissionsList: {
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  userRoleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 8,
  },
  userRoleText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

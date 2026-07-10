import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppTheme as theme } from '../theme';

export default function Users() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const handleAddUser = () => {
    if (!name.trim() || !email.trim() || !role.trim()) {
      Alert.alert('Erro', 'Preencha nome, e-mail e função.');
      return;
    }

    setUsers((prev) => [...prev, { id: Date.now().toString(), name: name.trim(), email: email.trim(), role: role.trim(), status: 'Ativo' }]);
    setShowModal(false);
    setName('');
    setEmail('');
    setRole('');
    Alert.alert('Sucesso', 'Usuário adicionado.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuários</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="add" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <Icon name="person-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>
            <View style={styles.userFooter}>
              <Text style={styles.userRole}>{user.role}</Text>
              <View style={[styles.statusBadge, user.status === 'Ativo' ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo usuário</Text>
            <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Função" value={role} onChangeText={setRole} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddUser}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: theme.colors.primary },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  userCard: { backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  userHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  userEmail: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
  userFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  userRole: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  activeBadge: { backgroundColor: theme.colors.success + '20' },
  inactiveBadge: { backgroundColor: theme.colors.textLight + '20' },
  statusText: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, fontSize: 16, backgroundColor: '#fff', color: theme.colors.text },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  cancelText: { color: theme.colors.textLight, fontWeight: '600' },
  saveButton: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '600' },
});

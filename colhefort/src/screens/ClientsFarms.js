import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function ClientsFarms() {
  const navigation = useNavigation();
  const { clients, addClient, updateClient, isDarkMode } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [farm, setFarm] = useState('');
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');
  const [notes, setNotes] = useState('');

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

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase();
    return clients
      .filter((client) =>
        client.name?.toLowerCase().includes(query) ||
        client.farm?.toLowerCase().includes(query) ||
        client.farmName?.toLowerCase().includes(query) ||
        client.phone?.includes(query)
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [clients, search]);

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setName(client.name || '');
      setEmail(client.email || '');
      setCpf(client.cpf || '');
      setPhone(client.phone || '');
      setFarm(client.farm || client.farmName || '');
      setAddress(client.address || '');
      setCep(client.cep || '');
      setNotes(client.notes || '');
    } else {
      setEditingClient(null);
      setName('');
      setEmail('');
      setCpf('');
      setPhone('');
      setFarm('');
      setAddress('');
      setCep('');
      setNotes('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do cliente é obrigatório.');
      return;
    }

    if (!editingClient && !email.trim()) {
      Alert.alert('Erro', 'E-mail do cliente é obrigatório para cadastro.');
      return;
    }

    if (cpf && cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Erro', 'CPF inválido. Digite 11 números.');
      return;
    }

    if (cep && cep.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'CEP inválido. Digite 8 números.');
      return;
    }

    const clientData = {
      name: name.trim(),
      email: email.trim(),
      cpf: cpf.trim(),
      phone: phone.trim(),
      farm: farm.trim(),
      address: address.trim(),
      cep: cep.trim(),
      notes: notes.trim()
    };

    try {
      if (editingClient) {
        await updateClient({ ...editingClient, ...clientData });
      } else {
        await addClient(clientData);
      }
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o cliente.');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: currentTheme.card, borderColor: currentTheme.border + '50', borderWidth: 1 }]} onPress={() => openModal(item)}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: currentTheme.primary + '15' }]}>
          <Icon name="business" size={20} color={currentTheme.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: currentTheme.text }]}>{item.name}</Text>
          <Text style={[styles.subtitle, { color: currentTheme.textLight }]}>{item.farm || item.farmName || 'Fazenda não informada'}</Text>
          {item.phone ? <Text style={[styles.subtitle, { color: currentTheme.textLight }]}>{item.phone}</Text> : null}
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color={currentTheme.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clientes / Fazendas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Icon name="add" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
        <Icon name="search" size={20} color={currentTheme.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: currentTheme.text }]}
          placeholder="Buscar por nome, fazenda ou telefone..."
          placeholderTextColor={currentTheme.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color={currentTheme.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: currentTheme.primary + '10' }]}>
              <Icon name="business" size={40} color={currentTheme.primary} />
            </View>
            <Text style={[styles.emptyText, { color: currentTheme.text }]}>Nenhum cliente cadastrado</Text>
            <Text style={[styles.emptySubtext, { color: currentTheme.textLight }]}>Adicione clientes para começar</Text>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>Nome</Text>
              <TextInput style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} value={name} onChangeText={setName} placeholder="Nome do cliente" placeholderTextColor={currentTheme.textLight} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>E-mail {!editingClient && '*'}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} 
                value={email} 
                onChangeText={setEmail} 
                placeholder="E-mail do cliente" 
                placeholderTextColor={currentTheme.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!editingClient}
              />
              {!editingClient && <Text style={[styles.hintText, { color: currentTheme.textLight }]}>Uma conta será criada com senha temporária</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>CPF</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} 
                value={cpf} 
                onChangeText={(text) => setCpf(maskCpf(text))} 
                placeholder="000.000.000-00" 
                keyboardType="numeric"
                maxLength={14}
                placeholderTextColor={currentTheme.textLight} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>Telefone</Text>
              <TextInput style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" placeholderTextColor={currentTheme.textLight} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>Fazenda</Text>
              <TextInput style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} value={farm} onChangeText={setFarm} placeholder="Nome da fazenda" placeholderTextColor={currentTheme.textLight} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>Endereço</Text>
              <TextInput style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} value={address} onChangeText={setAddress} placeholder="Endereço completo" placeholderTextColor={currentTheme.textLight} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>CEP</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]} 
                value={cep} 
                onChangeText={(text) => setCep(maskCep(text))} 
                placeholder="00000-000" 
                keyboardType="numeric"
                maxLength={9}
                placeholderTextColor={currentTheme.textLight} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.textLight }]}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, color: currentTheme.text }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Observações sobre o cliente"
                multiline
                placeholderTextColor={currentTheme.textLight}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: currentTheme.border }]} onPress={closeModal}>
                <Text style={[styles.cancelBtnText, { color: currentTheme.textLight }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: currentTheme.primary }]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary, textAlign: 'center' },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  addButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, paddingVertical: 4, fontSize: 15 },
  clearButton: { padding: 4, marginLeft: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 12 },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13, marginTop: 2 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15 },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 14 },
  hintText: { fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelBtn: { flex: 1, marginRight: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: { flex: 1, marginLeft: 12, borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});

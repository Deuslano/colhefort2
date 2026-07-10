import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function Suppliers() {
  const navigation = useNavigation();
  const { suppliers, addSupplier, updateSupplier } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const filteredSuppliers = useMemo(() => {
    const query = search.toLowerCase();
    return suppliers
      .filter((supplier) =>
        supplier.name?.toLowerCase().includes(query) ||
        supplier.contact?.toLowerCase().includes(query) ||
        supplier.phone?.includes(query)
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [suppliers, search]);

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setName(supplier.name || '');
      setContact(supplier.contact || '');
      setPhone(supplier.phone || '');
      setNotes(supplier.notes || '');
    } else {
      setEditingSupplier(null);
      setName('');
      setContact('');
      setPhone('');
      setNotes('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do fornecedor é obrigatório.');
      return;
    }

    const supplierData = { name: name.trim(), contact: contact.trim(), phone: phone.trim(), notes: notes.trim() };

    try {
      if (editingSupplier) {
        await updateSupplier({ ...editingSupplier, ...supplierData });
      } else {
        await addSupplier(supplierData);
      }
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o fornecedor.');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.contact || 'Sem contato cadastrado'}</Text>
        {item.phone ? <Text style={styles.subtitle}>{item.phone}</Text> : null}
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fornecedores</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Icon name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar fornecedores..."
          placeholderTextColor={theme.colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredSuppliers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cube-outline" size={52} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum fornecedor cadastrado.</Text>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome do fornecedor" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contato</Text>
              <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="Pessoa de contato" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Anotações adicionais"
                multiline
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
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
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: theme.colors.primary },
  headerTitle: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, margin: 20, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: theme.colors.text },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.card, padding: 16, borderRadius: 14, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardContent: { flex: 1, paddingRight: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textLight, marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 16, fontSize: 16, color: theme.colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: theme.colors.textLight, marginBottom: 6 },
  input: { backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 16, color: theme.colors.text },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, marginRight: 8, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { color: theme.colors.textLight, fontWeight: 'bold' },
  saveBtn: { flex: 1, marginLeft: 8, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center', paddingVertical: 14 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});

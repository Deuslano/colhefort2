import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Platform, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useAlert } from '../components/CustomAlert';
import { uploadToCloudinary } from '../utils/cloudinaryService';

const fieldLabels = {
  category: 'Categoria',
  status: 'Status',
};

const statuses = ['Disponível', 'Em andamento', 'Agendado'];

export default function MachineDetail() {
  const { machines, categories, units, updateMachine, deleteMachine } = useContext(AppContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useAlert();
  const routeMachine = route.params?.machine;

  const machine = useMemo(
    () => machines.find((m) => m.id === routeMachine?.id) || routeMachine || null,
    [machines, routeMachine]
  );

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [operator, setOperator] = useState('');
  const [status, setStatus] = useState('Disponível');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (machine) {
      setName(machine.name || '');
      setModel(machine.model || '');
      setOperator(machine.operator || '');
      setStatus(machine.status || 'Disponível');
      setCategoryId(machine.categoryId || '');
      setCategoryName(machine.categoryName || '');
      setImage(machine.imageUrl || null);
    }
  }, [machine]);

  const categoryItems = useMemo(() => [...categories].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [categories]);

  const openPicker = (type) => {
    setPickerType(type);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerType('');
  };

  const selectItem = (item) => {
    if (pickerType === 'category') {
      setCategoryId(item.id);
      setCategoryName(item.name);
    } else if (pickerType === 'status') {
      setStatus(item.name);
    }
    closePicker();
  };

  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: usar input de arquivo HTML
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            setUploading(true);
            try {
              const uploadResult = await uploadToCloudinary(file, 'samples/ecommerce', 'image');
              setImage(uploadResult.secure_url);
              setUploading(false);
              showAlert('Sucesso', 'Imagem enviada com sucesso!');
            } catch (error) {
              console.error('Erro ao enviar imagem:', error);
              showAlert('Erro', 'Não foi possível enviar a imagem.');
              setUploading(false);
            }
          }
        };
        input.click();
      } else {
        // Mobile: usar expo-image-picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setUploading(true);
          const asset = result.assets[0];
          const fileUri = asset.uri || asset.localUri;
          
          if (!fileUri) {
            throw new Error('URI do arquivo não encontrada');
          }
          
          const uploadResult = await uploadToCloudinary(fileUri, 'samples/ecommerce', 'image');
          setImage(uploadResult.secure_url);
          setUploading(false);
          showAlert('Sucesso', 'Imagem enviada com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      showAlert('Erro', 'Não foi possível enviar a imagem.');
      setUploading(false);
    }
  };

  const pickerItems = () => {
    if (pickerType === 'category') return categoryItems;
    if (pickerType === 'status') return statuses.map((label) => ({ id: label, name: label }));
    return [];
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert('Erro', 'Nome da máquina é obrigatório.');
      return;
    }

    try {
      await updateMachine({
        ...machine,
        name: name.trim(),
        model: model.trim(),
        operator: operator.trim(),
        status,
        categoryId,
        categoryName,
        imageUrl: image,
      });
      showAlert('Sucesso', 'Máquina atualizada.');
      setEditing(false);
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar as alterações.');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    showAlert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta máquina? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMachine(machine.id);
              showAlert('Sucesso', 'Máquina excluída.');
              navigation.goBack();
            } catch (error) {
              showAlert('Erro', 'Não foi possível excluir a máquina.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  if (!machine) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhe da Máquina</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.message}>Máquina não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhe da Máquina</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Icon name="trash-outline" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing((prev) => !prev)}>
            <Text style={styles.editButtonText}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Foto da Máquina</Text>
          {editing ? (
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage} disabled={uploading}>
              {uploading ? (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Enviando...</Text>
                </View>
              ) : image ? (
                <Image source={{ uri: image }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="camera-outline" size={40} color={theme.colors.textLight} />
                  <Text style={styles.imagePlaceholderText}>Adicionar foto</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.imageUpload}>
              {machine.imageUrl ? (
                <Image source={{ uri: machine.imageUrl }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="image-outline" size={40} color={theme.colors.textLight} />
                  <Text style={styles.imagePlaceholderText}>Sem foto</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informações gerais</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{machine.name}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>Modelo</Text>
            <Text style={styles.value}>{machine.model || '-'} </Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.value, { color: theme.colors.primary }]}>{machine.status || 'Sem status'}</Text>
          </View>
          {machine.categoryName ? (
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Categoria</Text>
              <Text style={styles.value}>{machine.categoryName}</Text>
            </View>
          ) : null}
        </View>

        {editing ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Editar Máquina</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo</Text>
              <TextInput style={styles.input} value={model} onChangeText={setModel} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Operador</Text>
              <TextInput style={styles.input} value={operator} onChangeText={setOperator} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria</Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => openPicker('category')}>
                <Text style={categoryName ? styles.selectText : styles.selectPlaceholder}>{categoryName || 'Selecione categoria'}</Text>
                <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => openPicker('status')}>
                <Text style={styles.selectText}>{status}</Text>
                <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar alterações</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>{fieldLabels[pickerType] || 'Selecione'}</Text>
            <FlatList
              data={pickerItems()}
              keyExtractor={(item) => item.id || item.name}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerItem} onPress={() => selectItem(item)}>
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.pickerCancel} onPress={closePicker}>
              <Text style={styles.pickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  editButton: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 16 },
  editButtonText: { color: theme.colors.primary, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  infoCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 16 },
  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14, color: theme.colors.textLight },
  value: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, maxWidth: '65%', textAlign: 'right' },
  formCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: theme.colors.border },
  inputGroup: { marginBottom: 16 },
  input: { backgroundColor: '#F5F7FA', borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, height: 50, fontSize: 16, color: theme.colors.text },
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F7FA', borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, height: 50 },
  selectText: { fontSize: 16, color: theme.colors.text },
  selectPlaceholder: { fontSize: 16, color: theme.colors.textLight },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  smallInputGroup: { flex: 1, marginRight: 12 },
  saveButton: { marginTop: 10, backgroundColor: theme.colors.primary, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  pickerContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '70%' },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 12 },
  pickerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  pickerItemText: { fontSize: 16, color: theme.colors.text },
  pickerCancel: { marginTop: 12, paddingVertical: 14, alignItems: 'center' },
  pickerCancelText: { fontSize: 16, color: theme.colors.primary, fontWeight: 'bold' },
  message: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center' },
  imageUpload: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textLight,
  },
});

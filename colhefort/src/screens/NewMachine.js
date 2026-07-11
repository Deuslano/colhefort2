import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useContext, useMemo, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useAlert } from '../components/CustomAlert';
import { uploadToCloudinary } from '../utils/cloudinaryService';

const fieldLabels = {
  category: 'Categoria',
  status: 'Status',
};

const statuses = ['Disponível', 'Em andamento', 'Agendado'];

export default function NewMachine() {
  const navigation = useNavigation();
  const { categories, units, addMachine } = useContext(AppContext);
  const { showAlert } = useAlert();

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

  const categoryItems = useMemo(() => [...categories].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [categories]);

  const openPicker = (type) => {
    setPickerType(type);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerType('');
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

  const selectItem = (item) => {
    if (pickerType === 'category') {
      setCategoryId(item.id);
      setCategoryName(item.name);
    } else if (pickerType === 'status') {
      setStatus(item);
    }
    closePicker();
  };

  const handleSave = () => {
    if (!name.trim() || !model.trim()) {
      showAlert('Erro', 'Preencha nome e modelo da máquina.');
      return;
    }

    addMachine({
      name: name.trim(),
      model: model.trim(),
      operator: operator.trim(),
      status,
      categoryId,
      categoryName,
      imageUrl: image,
      createdAt: new Date().toISOString(),
    });

    showAlert('Sucesso', 'Máquina cadastrada!');
    navigation.goBack();
  };

  const pickerItems = () => {
    if (pickerType === 'category') return categoryItems;
    if (pickerType === 'status') return statuses.map((label) => ({ id: label, name: label }));
    return [];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Máquina</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Foto da Máquina</Text>
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
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da Máquina *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Trator John Deere" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modelo</Text>
            <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Ex: 5083E" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Operador</Text>
            <TextInput style={styles.input} value={operator} onChangeText={setOperator} placeholder="Nome do operador" />
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

        <Text style={styles.infoMessage}>As máquinas podem ser cadastradas como seu patrimônio e alocadas depois para um cliente.</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar Máquina</Text>
        </TouchableOpacity>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: theme.colors.primary },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary },
  form: { flex: 1 },
  formContent: { padding: 20, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: theme.colors.textLight, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, height: 50, fontSize: 16, color: theme.colors.text },
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, height: 50 },
  selectText: { fontSize: 16, color: theme.colors.text },
  selectPlaceholder: { fontSize: 16, color: theme.colors.textLight },
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
  infoMessage: { fontSize: 14, color: theme.colors.textLight, marginBottom: 10 },
  saveButtonDisabled: { backgroundColor: theme.colors.border },
});

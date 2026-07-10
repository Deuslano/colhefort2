import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, Image, Platform } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppTheme as theme } from '../theme';
import { AppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

export default function ProductForm() {
  const route = useRoute();
  const editProduct = route.params?.product;

  const [name, setName] = useState(editProduct ? editProduct.name : '');
  const [code, setCode] = useState(editProduct ? editProduct.code : '');
  const [cost, setCost] = useState(editProduct ? editProduct.cost.toString() : '');
  const [price, setPrice] = useState(editProduct ? editProduct.price.toString() : '');
  const [stock, setStock] = useState(editProduct ? editProduct.stock.toString() : '');
  const [photoUri, setPhotoUri] = useState(editProduct?.photoUri || null);

  const { addProduct, updateProduct, deleteProduct } = useContext(AppContext);
  const navigation = useNavigation();

  const pickPhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error picking photo', err);
    }
  };

  const handleSave = () => {
    if (!name || !code || !cost || !price || !stock) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const pData = {
      name,
      code,
      cost: parseFloat(cost.replace(',', '.')),
      price: parseFloat(price.replace(',', '.')),
      stock: parseInt(stock, 10),
      photoUri
    };

    if (editProduct) {
      updateProduct({ ...pData, id: editProduct.id });
      Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
    } else {
      addProduct({ ...pData, id: Date.now().toString() });
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir este produto? Ele será removido do estoque.')) {
        deleteProduct(editProduct.id);
        window.alert('Produto removido com sucesso.');
        navigation.goBack();
      }
    } else {
      Alert.alert(
        'Excluir Produto',
        'Tem certeza que deseja excluir este produto? Ele será removido do estoque.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sim, Excluir', 
            style: 'destructive',
            onPress: () => {
              deleteProduct(editProduct.id);
              Alert.alert('Excluído', 'Produto removido com sucesso.');
              navigation.goBack();
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editProduct ? 'Editar Produto' : 'Novo Produto'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* Foto do Produto */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Icon name="camera-outline" size={40} color={theme.colors.textLight} />
                <Text style={styles.photoText}>Adicionar Foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Produto *</Text>
            <View style={styles.inputContainer}>
              <Icon name="cube-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Sabonete Líquido Amêndoa"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código SKU *</Text>
            <View style={styles.inputContainer}>
              <Icon name="barcode-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: 123456"
                value={code}
                onChangeText={setCode}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preços e Estoque</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Custo (R$) *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={cost}
                  onChangeText={setCost}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Venda (R$) *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estoque Inicial *</Text>
            <View style={styles.inputContainer}>
              <Icon name="layers-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{editProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</Text>
        </TouchableOpacity>

        {editProduct && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Icon name="trash-outline" size={20} color={theme.colors.danger} style={{marginRight: 6}} />
            <Text style={styles.deleteButtonText}>Excluir Produto</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photoBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoText: { color: theme.colors.textLight, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: theme.colors.text, marginBottom: 8, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, color: theme.colors.text, fontSize: 16 },
  saveButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  deleteButtonText: { color: theme.colors.danger, fontSize: 16, fontWeight: 'bold' },
});

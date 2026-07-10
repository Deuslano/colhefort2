import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function NewBonus() {
  const { products, addBonus } = useContext(AppContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [date] = useState(new Date().toLocaleDateString('pt-BR'));
  const navigation = useNavigation();

  const addProduct = (product) => {
    const exists = selectedItems.find(item => item.id === product.id);
    if (exists) {
      setSelectedItems(selectedItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    }
  };

  const removeProduct = (id) => {
    const item = selectedItems.find(p => p.id === id);
    if (item.quantity > 1) {
      setSelectedItems(selectedItems.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p
      ));
    } else {
      setSelectedItems(selectedItems.filter(p => p.id !== id));
    }
  };

  const finishBonus = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto bonificado.');
      return;
    }
    const bonus = {
      reason: reason || 'Motivo não informado',
      date,
      items: selectedItems,
    };
    addBonus(bonus);
    Alert.alert('Sucesso', 'Bonificação registrada com sucesso!');
    setSelectedItems([]);
    setReason('');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Bonificação</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes da Bonificação</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Motivo (Opcional)</Text>
            <View style={styles.inputContainer}>
              <Icon name="document-text-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Prêmio Trimestral"
                value={reason}
                onChangeText={setReason}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <View style={styles.dateContainer}>
              <Icon name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selecione os Produtos</Text>
          <View style={styles.productListWrapper}>
            {products.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>
            ) : (
              products.map(item => (
                <TouchableOpacity key={item.id} style={styles.productRow} onPress={() => addProduct(item)}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>Custo Ref: R$ {item.cost.toFixed(2)}</Text>
                  </View>
                  <View style={styles.addButton}>
                    <Icon name="add" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Produtos Bonificados</Text>
          
          {selectedItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Icon name="gift-outline" size={40} color={theme.colors.border} />
              <Text style={styles.emptyText}>Nenhum item adicionado</Text>
            </View>
          ) : (
            selectedItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemDetails}>{item.quantity} unidades recebidas</Text>
                </View>
                <View style={styles.cartItemActions}>
                  <TouchableOpacity onPress={() => removeProduct(item.id)} style={styles.removeButton}>
                    <Icon name="remove" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total de Itens</Text>
          <Text style={styles.totalValue}>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)} un.</Text>
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={finishBonus}>
          <Icon name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.finishText}>Salvar Bonificação</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // space for footer
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: theme.colors.text,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  productListWrapper: {
    maxHeight: 250,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  productPrice: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: theme.colors.textLight,
    fontStyle: 'italic',
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  cartItemDetails: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: theme.colors.danger,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary, 
  },
  finishButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

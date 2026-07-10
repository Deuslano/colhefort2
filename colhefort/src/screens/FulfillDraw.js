import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function FulfillDraw() {
  const { products, addPrizeDelivery, draws, consortiums, draftFulfillItems: selectedItems, setDraftFulfillItems: setSelectedItems } = useContext(AppContext);
  const navigation = useNavigation();
  const route = useRoute();
  
  const { drawId, consortiumId } = route.params || {};

  const draw = draws.find(d => d.id === drawId);
  const consortium = consortiums.find(c => c.id === consortiumId);

  const [date] = useState(new Date().toLocaleDateString('pt-BR'));

  if (!draw || !consortium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{textAlign: 'center', marginTop: 50}}>Dados não encontrados.</Text>
      </SafeAreaView>
    );
  }

  const maxPrizeValue = consortium.prizeValue ? consortium.prizeValue : (consortium.monthlyValue * consortium.durationMonths);
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  const finishDelivery = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto para entregar.');
      return;
    }

    if (total > maxPrizeValue) {
      Alert.alert(
        'Aviso de Valor',
        `O total de produtos (R$ ${total.toFixed(2)}) ultrapassa o valor do prêmio (R$ ${maxPrizeValue.toFixed(2)}).\nDeseja continuar mesmo assim?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim, Continuar', onPress: confirmDelivery }
        ]
      );
    } else {
      confirmDelivery();
    }
  };

  const confirmDelivery = () => {
    const deliveryId = Date.now().toString();

    const delivery = {
      id: deliveryId,
      drawId,
      consortiumId,
      winnerId: draw.winnerId,
      winnerName: draw.winnerName,
      date,
      items: selectedItems,
      total,
    };

    addPrizeDelivery(delivery);
    setSelectedItems([]); // Limpar rascunho após sucesso
    Alert.alert('Sucesso', `Prêmio entregue para ${draw.winnerName}!\nO valor foi descontado do estoque e do saldo final.`);
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrega de Prêmio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes do Ganhador</Text>
          
          <View style={styles.winnerInfoRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{draw.winnerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.winnerName}>{draw.winnerName}</Text>
              <Text style={styles.winnerSub}>{consortium.name}</Text>
            </View>
          </View>
          
          <View style={styles.prizeBox}>
            <Text style={styles.prizeLabel}>Valor do Prêmio:</Text>
            <Text style={styles.prizeValue}>R$ {maxPrizeValue.toFixed(2)}</Text>
          </View>
          <Text style={styles.hintText}>Adicione os produtos escolhidos pelo ganhador.</Text>
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
                    <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.addButton}>
                    <Icon name="add" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {selectedItems.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Itens Escolhidos</Text>
            {selectedItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemQty}>Qtd: {item.quantity}</Text>
                </View>
                <Text style={styles.cartItemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeProduct(item.id)} style={styles.cartRemoveBtn}>
                  <Icon name="remove-circle" size={24} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <View>
            <Text style={styles.totalLabel}>Total Escolhido</Text>
            <Text style={[styles.totalValue, total > maxPrizeValue ? {color: theme.colors.danger} : null]}>R$ {total.toFixed(2)}</Text>
          </View>
          <View>
            <Text style={styles.totalLabel}>Saldo Restante</Text>
            <Text style={styles.totalValueSecondary}>R$ {Math.max(0, maxPrizeValue - total).toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={finishDelivery}>
          <Icon name="gift" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.finishButtonText}>Finalizar Entrega</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
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
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 180 },
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
  winnerInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  winnerName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  winnerSub: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
  prizeBox: { backgroundColor: '#EEF3FF', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prizeLabel: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary },
  prizeValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  hintText: { fontSize: 13, color: theme.colors.textLight, marginTop: 10, fontStyle: 'italic' },
  // Products
  productListWrapper: { maxHeight: 300 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  productPrice: { fontSize: 14, color: theme.colors.primary, marginTop: 4, fontWeight: 'bold' },
  addButton: {
    backgroundColor: theme.colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { textAlign: 'center', color: theme.colors.textLight, fontStyle: 'italic', padding: 20 },
  // Cart
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  cartItemQty: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
  cartItemPrice: { fontSize: 15, fontWeight: 'bold', color: theme.colors.primary, marginRight: 10 },
  cartRemoveBtn: { padding: 4 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.card,
    padding: 20, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5,
  },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 13, color: theme.colors.textLight, marginBottom: 4 },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary },
  totalValueSecondary: { fontSize: 18, fontWeight: 'bold', color: theme.colors.success },
  finishButton: {
    flexDirection: 'row', backgroundColor: theme.colors.secondary, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  finishButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

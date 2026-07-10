import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function Draws({ route }) {
  const { consortiumId } = route.params || {};
  const { consortiums, draws, addDraw, updateConsortium, prizeDeliveries } = useContext(AppContext);
  const navigation = useNavigation();
  const [showConfetti, setShowConfetti] = useState(false);

  const consortium = consortiums.find(c => c.id === consortiumId);
  const pastDraws = draws.filter(d => d.consortiumId === consortiumId).sort((a, b) => b.id - a.id);

  if (!consortium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sorteio</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Consórcio não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDraw = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Só sorteia quem PAGOU este mês e ainda não ganhou
    const eligibleParticipants = consortium.participants.filter(p => {
      if (p.hasWon) return false;
      if (!p.payments) return false;
      return p.payments.some(pay => pay.month === currentMonth && pay.year === currentYear);
    });
    
    if (eligibleParticipants.length === 0) {
      const unpaidCount = consortium.participants.filter(p => {
        if (p.hasWon) return false;
        if (!p.payments) return true;
        return !p.payments.some(pay => pay.month === currentMonth && pay.year === currentYear);
      }).length;

      if (unpaidCount > 0) {
        Alert.alert(
          'Não há participantes elegíveis',
          `Existem ${unpaidCount} participante(s) que ainda não pagaram a mensalidade deste mês (${currentMonth}/${currentYear}). Somente quem pagou este mês pode participar do sorteio.`
        );
      } else {
        Alert.alert('Aviso', 'Todos os participantes já foram contemplados neste consórcio!');
      }
      return;
    }

    // Verificar se já houve sorteio neste mês
    const hasDrawnThisMonth = pastDraws.some(d => d.month === currentMonth && d.year === currentYear);
    
    if (hasDrawnThisMonth) {
      Alert.alert(
        'Atenção', 
        'Já foi realizado um sorteio neste mês. Deseja realizar um sorteio extra?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sortear Extra', onPress: () => executeDraw(eligibleParticipants) }
        ]
      );
    } else {
      executeDraw(eligibleParticipants);
    }
  };

  const executeDraw = (eligibleParticipants) => {
    const now = new Date();
    
    // Sorteio Aleatório
    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const winner = eligibleParticipants[randomIndex];

    // Salvar Sorteio
    const newDraw = {
      consortiumId: consortium.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      date: now.toLocaleDateString('pt-BR'),
      winnerId: winner.id,
      winnerName: winner.name,
    };
    addDraw(newDraw);

    // Atualizar status do participante
    const updatedParticipants = consortium.participants.map(p => 
      p.id === winner.id ? { ...p, hasWon: true } : p
    );
    updateConsortium({ ...consortium, participants: updatedParticipants });

    setShowConfetti(true);
    
    Alert.alert(
      '🎉 CONTEMPLADO! 🎉', 
      `O sorteado deste mês foi:\n\n✨ ${winner.name} ✨\n\nValor: R$ ${consortium.monthlyValue.toFixed(2)} em produtos`
    );
  };

  const nowCheck = new Date();
  const checkMonth = nowCheck.getMonth() + 1;
  const checkYear = nowCheck.getFullYear();

  const eligibleCount = consortium.participants.filter(p => {
    if (p.hasWon) return false;
    if (!p.payments) return false;
    return p.payments.some(pay => pay.month === checkMonth && pay.year === checkYear);
  }).length;

  const wonCount = consortium.participants.filter(p => p.hasWon).length;

  const unpaidCount = consortium.participants.filter(p => {
    if (p.hasWon) return false;
    if (!p.payments) return true;
    return !p.payments.some(pay => pay.month === checkMonth && pay.year === checkYear);
  }).length;

  const renderDrawItem = ({ item }) => {
    const isDelivered = prizeDeliveries.some(p => p.drawId === item.id);
    return (
      <View style={styles.drawCard}>
        <View style={styles.drawIconContainer}>
          <Icon name="trophy" size={28} color={theme.colors.secondary} />
        </View>
        <View style={styles.drawInfo}>
          <Text style={styles.drawTitle}>{item.winnerName}</Text>
          <Text style={styles.drawDate}>Sorteio em: {item.date}</Text>
          {isDelivered && (
            <Text style={{color: theme.colors.success, fontSize: 12, marginTop: 4, fontWeight: 'bold'}}>✓ Prêmio Entregue</Text>
          )}
        </View>
        {!isDelivered ? (
          <TouchableOpacity 
            style={{backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8}}
            onPress={() => navigation.navigate('FulfillDraw', { drawId: item.id, consortiumId: consortium.id })}
          >
            <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold'}}>ENTREGAR</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.drawBadge}>
            <Icon name="star" size={14} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sorteios</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.consortiumInfo}>
        <Text style={styles.consortiumName}>{consortium.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{eligibleCount}</Text>
            <Text style={styles.statLabel}>Elegíveis</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxCenter]}>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>{wonCount}</Text>
            <Text style={styles.statLabel}>Contemplados</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.colors.danger }]}>{unpaidCount}</Text>
            <Text style={styles.statLabel}>Sem Pagamento</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={pastDraws}
        keyExtractor={item => item.id.toString()}
        renderItem={renderDrawItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Histórico de Contemplados</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="ticket-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum sorteio realizado ainda.</Text>
            <Text style={styles.emptySubText}>
              Apenas participantes com pagamento em dia participam.
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Elegíveis para sorteio</Text>
          <Text style={styles.footerValue}>{eligibleCount} participantes</Text>
        </View>
        <TouchableOpacity style={styles.drawButton} onPress={handleDraw}>
          <Icon name="shuffle" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.drawButtonText}>Sortear</Text>
        </TouchableOpacity>
      </View>
      {showConfetti && (
        <ConfettiCannon 
          count={200} 
          origin={{x: -10, y: 0}} 
          autoStart={true} 
          fadeOut={true}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
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
  consortiumInfo: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  consortiumName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  list: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  drawCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
  },
  drawIconContainer: {
    marginRight: 15,
    backgroundColor: '#FFF5E5',
    padding: 10,
    borderRadius: 10,
  },
  drawInfo: {
    flex: 1,
  },
  drawTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  drawDate: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  drawBadge: {
    backgroundColor: theme.colors.secondary,
    padding: 6,
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textLight,
    fontWeight: 'bold',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 13,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  drawButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function DrawsTab() {
  const { consortiums, draws } = useContext(AppContext);
  const navigation = useNavigation();

  const allDraws = draws.sort((a, b) => b.id - a.id);

  const renderConsortiumCard = ({ item }) => {
    const consortiumDraws = draws.filter(d => d.consortiumId === item.id);
    const totalContemplated = item.participants ? item.participants.filter(p => p.hasWon).length : 0;
    const totalParticipants = item.participants ? item.participants.length : 0;

    return (
      <TouchableOpacity
        style={styles.consortiumCard}
        onPress={() => navigation.navigate('Draws', { consortiumId: item.id })}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Icon name="gift" size={28} color={theme.colors.secondary} />
          </View>
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.consortiumName}>{item.name}</Text>
          <Text style={styles.consortiumSub}>
            {totalContemplated}/{totalParticipants} contemplados • {consortiumDraws.length} sorteios
          </Text>
        </View>
        <Icon name="chevron-forward" size={22} color={theme.colors.textLight} />
      </TouchableOpacity>
    );
  };

  const renderDrawItem = ({ item }) => (
    <View style={styles.drawCard}>
      <View style={styles.drawIconContainer}>
        <Icon name="trophy" size={24} color={theme.colors.secondary} />
      </View>
      <View style={styles.drawInfo}>
        <Text style={styles.drawWinner}>{item.winnerName}</Text>
        <Text style={styles.drawDate}>{item.date}</Text>
      </View>
      <View style={styles.drawBadge}>
        <Text style={styles.drawBadgeText}>Contemplado</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sorteios</Text>
      </View>

      <FlatList
        data={[1]} // dummy to use as container
        keyExtractor={() => 'main'}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Grupos com Sorteio</Text>
            {consortiums.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="people-outline" size={50} color={theme.colors.border} />
                <Text style={styles.emptyText}>Nenhum consórcio cadastrado.</Text>
              </View>
            ) : (
              consortiums.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.consortiumCard}
                  onPress={() => navigation.navigate('Draws', { consortiumId: item.id })}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.iconContainer}>
                      <Icon name="gift" size={28} color={theme.colors.secondary} />
                    </View>
                  </View>
                  <View style={styles.cardCenter}>
                    <Text style={styles.consortiumName}>{item.name}</Text>
                    <Text style={styles.consortiumSub}>
                      {item.participants ? item.participants.filter(p => p.hasWon).length : 0}/{item.participants ? item.participants.length : 0} contemplados
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={22} color={theme.colors.textLight} />
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Últimos Contemplados</Text>
            {allDraws.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="ticket-outline" size={50} color={theme.colors.border} />
                <Text style={styles.emptyText}>Nenhum sorteio realizado ainda.</Text>
              </View>
            ) : (
              allDraws.map(item => (
                <View key={item.id} style={styles.drawCard}>
                  <View style={styles.drawIconContainer}>
                    <Icon name="trophy" size={24} color={theme.colors.secondary} />
                  </View>
                  <View style={styles.drawInfo}>
                    <Text style={styles.drawWinner}>{item.winnerName}</Text>
                    <Text style={styles.drawDate}>{item.date}</Text>
                  </View>
                  <View style={styles.drawBadge}>
                    <Text style={styles.drawBadgeText}>Contemplado</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  consortiumCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  cardLeft: {
    marginRight: 15,
  },
  iconContainer: {
    backgroundColor: '#FFF5E5',
    padding: 10,
    borderRadius: 12,
  },
  cardCenter: {
    flex: 1,
  },
  consortiumName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  consortiumSub: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 3,
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
    padding: 8,
    borderRadius: 10,
  },
  drawInfo: {
    flex: 1,
  },
  drawWinner: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  drawDate: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 3,
  },
  drawBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  drawBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textLight,
  },
});

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { AppTheme as theme } from '../theme';

export default function PlaceholderScreen({ route }) {
  const title = route?.params?.title || route?.name || 'Tela';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>Esta tela ainda não foi implementada.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  card: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
});

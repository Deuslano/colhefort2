import React, { createContext, useContext, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);
  const { isDarkMode } = useContext(AppContext);

  const currentTheme = isDarkMode ? { background: '#1a1a1a', card: '#2a2a2a', text: '#ffffff', textLight: '#aaaaaa', primary: '#4CAF50', danger: '#f44336' } : { background: '#ffffff', card: '#ffffff', text: '#333333', textLight: '#666666', primary: '#4CAF50', danger: '#f44336' };

  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    setAlertConfig({ title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={!!alertConfig}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.overlay}>
          <View style={[styles.alertBox, { backgroundColor: currentTheme.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: currentTheme.primary + '20' }]}>
              <Icon name="information-circle" size={40} color={currentTheme.primary} />
            </View>
            <Text style={[styles.title, { color: currentTheme.text }]}>{alertConfig?.title}</Text>
            <ScrollView style={styles.messageContainer}>
              <Text style={[styles.message, { color: currentTheme.textLight }]}>{alertConfig?.message}</Text>
            </ScrollView>
            <View style={styles.buttonContainer}>
              {alertConfig?.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' ? styles.cancelButton : styles.confirmButton,
                    button.style === 'cancel' ? { borderColor: currentTheme.textLight } : { backgroundColor: currentTheme.primary }
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    hideAlert();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    button.style === 'cancel' ? { color: currentTheme.text } : { color: '#ffffff' }
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  messageContainer: {
    maxHeight: 150,
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmButton: {
    // backgroundColor is set dynamically
  },
  cancelButton: {
    borderWidth: 1,
    // borderColor is set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Helper function to use Alert like the native Alert.alert
export const CustomAlert = {
  alert: (title, message, buttons) => {
    const { showAlert } = useAlert();
    showAlert(title, message, buttons);
  },
};

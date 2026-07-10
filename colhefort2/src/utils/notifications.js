import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permission');
    return false;
  }

  return true;
};

// Schedule a local notification
export const scheduleNotification = async (title, body, data = {}) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Schedule a delayed notification
export const scheduleDelayedNotification = async (title, body, seconds, data = {}) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { seconds },
    });
  } catch (error) {
    console.error('Error scheduling delayed notification:', error);
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

// Notification templates for the app
export const NotificationTemplates = {
  ALLOCATION_APPROVED: (machineName, value) => ({
    title: 'Solicitação Aprovada!',
    body: `Sua solicitação para ${machineName} foi aprovada. Valor: R$ ${value.toFixed(2)}`,
  }),
  ALLOCATION_REJECTED: (machineName, reason) => ({
    title: 'Solicitação Rejeitada',
    body: `Sua solicitação para ${machineName} foi rejeitada. Motivo: ${reason}`,
  }),
  ALLOCATION_STARTING: (machineName, date) => ({
    title: 'Serviço Iniciando',
    body: `O serviço com ${machineName} iniciará em breve: ${date}`,
  }),
  ALLOCATION_ENDING: (machineName, date) => ({
    title: 'Serviço Terminando',
    body: `O serviço com ${machineName} terminará em breve: ${date}`,
  }),
  NEW_REQUEST: (clientName, machineName) => ({
    title: 'Nova Solicitação',
    body: `${clientName} solicitou ${machineName}. Aguardando aprovação.`,
  }),
  MACHINE_AVAILABLE: (machineName) => ({
    title: 'Máquina Disponível',
    body: `${machineName} está disponível para alocação.`,
  }),
};

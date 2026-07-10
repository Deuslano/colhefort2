import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-dismiss after 5 seconds for success notifications
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(c => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Helper functions for common notifications
  const notifyLowStock = useCallback((productName, stock) => {
    addNotification({
      type: 'warning',
      title: 'Estoque Baixo',
      message: `Produto ${productName} com estoque crítico: ${stock} unidades`,
      category: 'inventory',
    });
  }, [addNotification]);

  const notifyInactiveClient = useCallback((clientName) => {
    addNotification({
      type: 'warning',
      title: 'Cliente Inativo',
      message: `Cliente ${clientName} sem alocações nos últimos 30 dias`,
      category: 'clients',
    });
  }, [addNotification]);

  const notifyApprovalRequired = useCallback((allocationId, clientName, value) => {
    addNotification({
      type: 'alert',
      title: 'Aprovação Requerida',
      message: `Alocação para ${clientName} (R$ ${value}) requer aprovação`,
      category: 'approvals',
      action: { type: 'approve', id: allocationId },
    });
  }, [addNotification]);

  const notifySaleCreated = useCallback((clientName, value) => {
    addNotification({
      type: 'success',
      title: 'Venda Realizada',
      message: `Venda para ${clientName} no valor de R$ ${value}`,
      category: 'sales',
    });
  }, [addNotification]);

  const notifyExpenseCreated = useCallback((category, value) => {
    addNotification({
      type: 'info',
      title: 'Despesa Registrada',
      message: `Despesa de ${category}: R$ ${value}`,
      category: 'expenses',
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      notifyLowStock,
      notifyInactiveClient,
      notifyApprovalRequired,
      notifySaleCreated,
      notifyExpenseCreated,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

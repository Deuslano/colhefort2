// Simple notification service that can be imported anywhere
// This will be replaced by the context-based system in UI components

class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(notification) {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    
    this.notifications.unshift(newNotification);
    this.listeners.forEach(listener => listener(newNotification));
    
    // Also log to console for debugging
    console.log('NOTIFICATION:', notification.title, notification.message);
  }

  notifyLowStock(productName, stock) {
    this.notify({
      type: 'warning',
      title: 'Estoque Baixo',
      message: `Produto ${productName} com estoque crítico: ${stock} unidades`,
      category: 'inventory',
    });
  }

  notifyInactiveClient(clientName) {
    this.notify({
      type: 'warning',
      title: 'Cliente Inativo',
      message: `Cliente ${clientName} sem alocações nos últimos 30 dias`,
      category: 'clients',
    });
  }

  notifyApprovalRequired(allocationId, clientName, value) {
    this.notify({
      type: 'alert',
      title: 'Aprovação Requerida',
      message: `Alocação para ${clientName} (R$ ${value}) requer aprovação`,
      category: 'approvals',
      action: { type: 'approve', id: allocationId },
    });
  }

  notifySaleCreated(clientName, value) {
    this.notify({
      type: 'success',
      title: 'Venda Realizada',
      message: `Venda para ${clientName} no valor de R$ ${value}`,
      category: 'sales',
    });
  }

  notifyExpenseCreated(category, value) {
    this.notify({
      type: 'info',
      title: 'Despesa Registrada',
      message: `Despesa de ${category}: R$ ${value}`,
      category: 'expenses',
    });
  }

  getNotifications() {
    return this.notifications;
  }

  clear() {
    this.notifications = [];
  }
}

export const notificationService = new NotificationService();

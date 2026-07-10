import AsyncStorage from '@react-native-async-storage/async-storage';

class BackupService {
  constructor() {
    this.BACKUP_KEY = '@app_backup';
    this.LAST_BACKUP_KEY = '@last_backup_date';
  }

  // Create backup of all data
  async createBackup(data) {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: data,
      };

      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      await AsyncStorage.setItem(this.LAST_BACKUP_KEY, new Date().toISOString());
      
      console.log('Backup criado com sucesso:', backup.timestamp);
      return { success: true, timestamp: backup.timestamp };
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Restore backup
  async restoreBackup() {
    try {
      const backupJson = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupJson) {
        return { success: false, error: 'Nenhum backup encontrado' };
      }

      const backup = JSON.parse(backupJson);
      console.log('Backup restaurado de:', backup.timestamp);
      
      return { success: true, data: backup.data, timestamp: backup.timestamp };
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Get last backup date
  async getLastBackupDate() {
    try {
      const lastBackup = await AsyncStorage.getItem(this.LAST_BACKUP_KEY);
      return lastBackup ? new Date(lastBackup) : null;
    } catch (error) {
      console.error('Erro ao obter data do último backup:', error);
      return null;
    }
  }

  // Export data to CSV format
  exportToCSV(collectionName, data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        `"${String(value || '').replace(/"/g, '""')}"`
      ).join(',')
    );

    return `${headers}\n${rows.join('\n')}`;
  }

  // Export all collections to CSV
  exportAllToCSV(data) {
    const exports = {};
    
    Object.keys(data).forEach(collectionName => {
      const collectionData = data[collectionName];
      if (Array.isArray(collectionData) && collectionData.length > 0) {
        exports[collectionName] = this.exportToCSV(collectionName, collectionData);
      }
    });

    return exports;
  }

  // Schedule automatic daily backup
  scheduleAutoBackup(data, interval = 24 * 60 * 60 * 1000) { // 24 hours default
    setInterval(async () => {
      await this.createBackup(data);
    }, interval);
  }

  // Check if backup is needed (more than 24 hours since last backup)
  async needsBackup() {
    const lastBackup = await this.getLastBackupDate();
    if (!lastBackup) return true;

    const now = new Date();
    const hoursSinceBackup = (now - lastBackup) / (1000 * 60 * 60);
    
    return hoursSinceBackup >= 24;
  }

  // Delete old backup
  async clearBackup() {
    try {
      await AsyncStorage.removeItem(this.BACKUP_KEY);
      await AsyncStorage.removeItem(this.LAST_BACKUP_KEY);
      console.log('Backup removido com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover backup:', error);
      return { success: false, error: error.message };
    }
  }
}

export const backupService = new BackupService();

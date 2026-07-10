import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform detection
const isWeb = typeof window !== 'undefined' && typeof window.navigator !== 'undefined';

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.pendingOperations = [];
    this.PENDING_OPS_KEY = '@pending_operations';
    this.CACHE_PREFIX = '@cache_';
    
    // Initialize online status
    if (isWeb) {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingOperations();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  // Initialize network listener (for React Native with NetInfo)
  initializeNetworkListener(callback) {
    if (!isWeb) {
      // For React Native, would use NetInfo here
      // For now, we'll use a simple check
      callback(this.isOnline);
      return () => {}; // Return unsubscribe function
    }
    
    // Web already has event listeners in constructor
    callback(this.isOnline);
    return () => {
      // Remove event listeners for web
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }

  // Check if currently online
  async checkConnection() {
    if (isWeb) {
      this.isOnline = navigator.onLine;
    } else {
      // For React Native, would use NetInfo here
      this.isOnline = true; // Default to online for now
    }
    return this.isOnline;
  }

  // Cache data locally
  async cacheData(key, data) {
    try {
      await AsyncStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(data));
      console.log(`Data cached for key: ${key}`);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Clear cached data
  async clearCache(key) {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Clear all cache
  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('All cache cleared');
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  // Add operation to pending queue
  async addPendingOperation(operation) {
    try {
      this.pendingOperations.push({
        ...operation,
        timestamp: new Date().toISOString(),
        id: Date.now(),
      });
      
      await AsyncStorage.setItem(
        this.PENDING_OPS_KEY, 
        JSON.stringify(this.pendingOperations)
      );
      
      console.log('Operation added to pending queue:', operation.type);
    } catch (error) {
      console.error('Error adding pending operation:', error);
    }
  }

  // Load pending operations from storage
  async loadPendingOperations() {
    try {
      const pending = await AsyncStorage.getItem(this.PENDING_OPS_KEY);
      this.pendingOperations = pending ? JSON.parse(pending) : [];
      return this.pendingOperations;
    } catch (error) {
      console.error('Error loading pending operations:', error);
      return [];
    }
  }

  // Sync pending operations when online
  async syncPendingOperations() {
    if (this.pendingOperations.length === 0) {
      this.pendingOperations = await this.loadPendingOperations();
    }

    if (this.pendingOperations.length === 0) {
      return { synced: 0, failed: 0 };
    }

    console.log(`Syncing ${this.pendingOperations.length} pending operations...`);
    
    let synced = 0;
    let failed = 0;

    // Process operations in order
    for (const operation of this.pendingOperations) {
      try {
        await this.executeOperation(operation);
        synced++;
      } catch (error) {
        console.error('Failed to sync operation:', operation, error);
        failed++;
      }
    }

    // Clear synced operations
    if (synced > 0) {
      this.pendingOperations = this.pendingOperations.slice(synced);
      await AsyncStorage.setItem(
        this.PENDING_OPS_KEY, 
        JSON.stringify(this.pendingOperations)
      );
    }

    console.log(`Sync complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }

  // Execute a single operation (to be implemented with actual Firebase calls)
  async executeOperation(operation) {
    // This would need to be implemented with actual Firebase operations
    // For now, it's a placeholder
    console.log('Executing operation:', operation.type, operation.data);
    
    // Example implementation:
    // switch (operation.type) {
    //   case 'addSale':
    //     await addDoc(collection(db, 'sales'), operation.data);
    //     break;
    //   case 'updateProduct':
    //     await updateDoc(doc(db, 'products', operation.id), operation.data);
    //     break;
    //   // etc...
    // }
    
    return true;
  }

  // Get pending operations count
  getPendingOperationsCount() {
    return this.pendingOperations.length;
  }

  // Clear all pending operations
  async clearPendingOperations() {
    this.pendingOperations = [];
    await AsyncStorage.removeItem(this.PENDING_OPS_KEY);
  }

  // Queue an operation for later sync
  async queueOperation(type, collection, data, id = null) {
    const operation = {
      type,
      collection,
      data,
      id,
    };

    if (this.isOnline) {
      try {
        await this.executeOperation(operation);
        return { success: true, queued: false };
      } catch (error) {
        console.error('Operation failed, queuing for later:', error);
        await this.addPendingOperation(operation);
        return { success: false, queued: true, error: error.message };
      }
    } else {
      await this.addPendingOperation(operation);
      return { success: false, queued: true, error: 'Offline' };
    }
  }

  // Get offline status
  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.pendingOperations.length,
      hasPendingData: this.pendingOperations.length > 0,
    };
  }

  // Enable offline mode for specific collections
  async enableOfflineMode(collections) {
    const settings = {
      enabled: true,
      collections,
      lastSync: new Date().toISOString(),
    };

    await AsyncStorage.setItem('@offline_settings', JSON.stringify(settings));
    return settings;
  }

  // Get offline mode settings
  async getOfflineSettings() {
    try {
      const settings = await AsyncStorage.getItem('@offline_settings');
      return settings ? JSON.parse(settings) : { enabled: false, collections: [] };
    } catch (error) {
      return { enabled: false, collections: [] };
    }
  }

  // Disable offline mode
  async disableOfflineMode() {
    await AsyncStorage.removeItem('@offline_settings');
    await this.clearAllCache();
    return { enabled: false };
  }
}

export const offlineService = new OfflineService();

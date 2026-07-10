import { addDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class AuditLogService {
  constructor() {
    this.COLLECTION_NAME = 'auditLogs';
  }

  // Log an action
  async logAction(action, collection, documentId, userId, changes = {}) {
    try {
      const logEntry = {
        action, // 'create', 'update', 'delete'
        collection,
        documentId,
        userId,
        userName: '', // Will be filled by caller
        changes,
        timestamp: new Date().toISOString(),
        ipAddress: '', // Can be added if needed
        userAgent: '', // Can be added if needed
      };

      await addDoc(collection(db, this.COLLECTION_NAME), logEntry);
      console.log('Audit log entry created:', action, collection, documentId);
    } catch (error) {
      console.error('Error creating audit log entry:', error);
    }
  }

  // Get audit logs for a specific document
  getDocumentLogs(documentId, callback) {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('documentId', '==', documentId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      callback(logs);
    });
  }

  // Get audit logs for a specific user
  getUserLogs(userId, callback) {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      callback(logs);
    });
  }

  // Get audit logs for a specific collection
  getCollectionLogs(collectionName, callback) {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('collection', '==', collectionName),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      callback(logs);
    });
  }

  // Get all audit logs (admin only)
  getAllLogs(callback, limit = 100) {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).slice(0, limit);
      callback(logs);
    });
  }

  // Format changes for display
  formatChanges(changes) {
    const formatted = [];
    Object.entries(changes).forEach(([key, value]) => {
      formatted.push(`${key}: ${JSON.stringify(value)}`);
    });
    return formatted.join(', ');
  }
}

export const auditLogService = new AuditLogService();

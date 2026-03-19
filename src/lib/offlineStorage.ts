import { openDB, IDBPDatabase } from 'idb';

// Define database types
interface HealthMetric {
  id: string;
  userId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
  synced: boolean;
}

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctor: any;
  date: string;
  time: string;
  reason: string;
  symptoms?: string[];
  status: string;
  synced: boolean;
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  synced: boolean;
}

interface Prescription {
  id: string;
  userId: string;
  doctorId: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  createdAt: Date;
  synced: boolean;
}

interface MediCareDB {
  healthMetrics: {
    key: string;
    value: HealthMetric;
    indexes: {
      'by-user': string;
      'by-timestamp': string;
      synced: string;
    };
  };
  appointments: {
    key: string;
    value: Appointment;
    indexes: {
      'by-user': string;
      'by-doctor': string;
      'by-date': string;
      synced: string;
    };
  };
  chatMessages: {
    key: string;
    value: ChatMessage;
    indexes: {
      'by-user': string;
      'by-timestamp': string;
      synced: string;
    };
  };
  prescriptions: {
    key: string;
    value: Prescription;
    indexes: {
      'by-user': string;
      'by-doctor': string;
      synced: string;
    };
  };
}

let db: IDBPDatabase<MediCareDB> | null = null;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<MediCareDB>> {
  if (db) return db;

  db = await openDB<MediCareDB>('MediCareDB', 1, {
    upgrade(db) {
      // Health metrics store
      const healthMetricsStore = db.createObjectStore('healthMetrics', {
        keyPath: 'id',
      });
      healthMetricsStore.createIndex('by-user', 'userId');
      healthMetricsStore.createIndex('by-timestamp', 'timestamp');
      healthMetricsStore.createIndex('synced', 'synced');

      // Appointments store
      const appointmentsStore = db.createObjectStore('appointments', {
        keyPath: 'id',
      });
      appointmentsStore.createIndex('by-user', 'userId');
      appointmentsStore.createIndex('by-date', 'date');
      appointmentsStore.createIndex('synced', 'synced');

      // Chat messages store
      const chatMessagesStore = db.createObjectStore('chatMessages', {
        keyPath: 'id',
      });
      chatMessagesStore.createIndex('by-user', 'userId');
      chatMessagesStore.createIndex('by-timestamp', 'timestamp');
      chatMessagesStore.createIndex('synced', 'synced');

      // Prescriptions store
      const prescriptionsStore = db.createObjectStore('prescriptions', {
        keyPath: 'id',
      });
      prescriptionsStore.createIndex('by-user', 'userId');
      prescriptionsStore.createIndex('by-date', 'createdAt');
      prescriptionsStore.createIndex('synced', 'synced');
    },
  });

  return db;
}

// Health Metrics Operations
export async function saveHealthMetric(metric: any) {
  const db = await initDB();
  const metricWithSync = {
    ...metric,
    synced: false,
    timestamp: new Date(metric.timestamp),
  };
  return await db.add('healthMetrics', metricWithSync);
}

export async function getHealthMetrics(userId: string) {
  const db = await initDB();
  return await db.getAllFromIndex('healthMetrics', 'by-user', userId);
}

export async function getUnsyncedHealthMetrics() {
  const db = await initDB();
  try {
    // Use getAll with a filter instead of index query
    const allMetrics = await db.getAll('healthMetrics');
    return allMetrics.filter(metric => !metric.synced);
  } catch (error) {
    console.error('Error getting unsynced health metrics:', error);
    return [];
  }
}

export async function markHealthMetricSynced(id: string) {
  const db = await initDB();
  const metric = await db.get('healthMetrics', id);
  if (metric) {
    metric.synced = true;
    return await db.put('healthMetrics', metric);
  }
}

// Appointments Operations
export async function saveAppointment(appointment: any) {
  const db = await initDB();
  const appointmentWithSync = {
    ...appointment,
    synced: false,
    createdAt: new Date(),
  };
  return await db.add('appointments', appointmentWithSync);
}

export async function getAppointments(userId: string) {
  const db = await initDB();
  return await db.getAllFromIndex('appointments', 'by-user', userId);
}

export async function getUnsyncedAppointments() {
  const db = await initDB();
  try {
    // Use getAll with a filter instead of index query
    const allAppointments = await db.getAll('appointments');
    return allAppointments.filter(appointment => !appointment.synced);
  } catch (error) {
    console.error('Error getting unsynced appointments:', error);
    return [];
  }
}

export async function markAppointmentSynced(id: string) {
  const db = await initDB();
  const appointment = await db.get('appointments', id);
  if (appointment) {
    appointment.synced = true;
    return await db.put('appointments', appointment);
  }
}

// Chat Messages Operations
export async function saveChatMessage(message: any) {
  const db = await initDB();
  const messageWithSync = {
    ...message,
    synced: false,
    timestamp: new Date(message.timestamp),
  };
  return await db.add('chatMessages', messageWithSync);
}

export async function getChatMessages(userId: string) {
  const db = await initDB();
  return await db.getAllFromIndex('chatMessages', 'by-user', userId);
}

export async function getUnsyncedChatMessages() {
  const db = await initDB();
  try {
    // Use getAll with a filter instead of index query
    const allMessages = await db.getAll('chatMessages');
    return allMessages.filter(message => !message.synced);
  } catch (error) {
    console.error('Error getting unsynced chat messages:', error);
    return [];
  }
}

export async function markChatMessageSynced(id: string) {
  const db = await initDB();
  const message = await db.get('chatMessages', id);
  if (message) {
    message.synced = true;
    return await db.put('chatMessages', message);
  }
}

// Prescriptions Operations
export async function savePrescription(prescription: any) {
  const db = await initDB();
  const prescriptionWithSync = {
    ...prescription,
    synced: false,
    createdAt: new Date(),
  };
  return await db.add('prescriptions', prescriptionWithSync);
}

export async function getPrescriptions(userId: string) {
  const db = await initDB();
  return await db.getAllFromIndex('prescriptions', 'by-user', userId);
}

export async function getUnsyncedPrescriptions() {
  const db = await initDB();
  try {
    // Use getAll with a filter instead of index query
    const allPrescriptions = await db.getAll('prescriptions');
    return allPrescriptions.filter(prescription => !prescription.synced);
  } catch (error) {
    console.error('Error getting unsynced prescriptions:', error);
    return [];
  }
}

export async function markPrescriptionSynced(id: string) {
  const db = await initDB();
  const prescription = await db.get('prescriptions', id);
  if (prescription) {
    prescription.synced = true;
    return await db.put('prescriptions', prescription);
  }
}

// Sync Operations
export async function syncAllData(userId: string) {
  try {
    // Sync health metrics
    const unsyncedMetrics = await getUnsyncedHealthMetrics();
    for (const metric of unsyncedMetrics) {
      try {
        const response = await fetch('/api/health-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
        });
        if (response.ok) {
          await markHealthMetricSynced(metric.id);
        }
      } catch (error) {
        console.error('Failed to sync health metric:', error);
      }
    }

    // Sync appointments
    const unsyncedAppointments = await getUnsyncedAppointments();
    for (const appointment of unsyncedAppointments) {
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointment),
        });
        if (response.ok) {
          await markAppointmentSynced(appointment.id);
        }
      } catch (error) {
        console.error('Failed to sync appointment:', error);
      }
    }

    // Sync chat messages
    const unsyncedMessages = await getUnsyncedChatMessages();
    for (const message of unsyncedMessages) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        if (response.ok) {
          await markChatMessageSynced(message.id);
        }
      } catch (error) {
        console.error('Failed to sync chat message:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Get offline status summary
export async function getOfflineStatus(userId: string) {
  const [
    unsyncedMetrics,
    unsyncedAppointments,
    unsyncedMessages,
    unsyncedPrescriptions,
  ] = await Promise.all([
    getUnsyncedHealthMetrics(),
    getUnsyncedAppointments(),
    getUnsyncedChatMessages(),
    getUnsyncedPrescriptions(),
  ]);

  return {
    isOnline: isOnline(),
    unsyncedItems: {
      healthMetrics: unsyncedMetrics.length,
      appointments: unsyncedAppointments.length,
      chatMessages: unsyncedMessages.length,
      prescriptions: unsyncedPrescriptions.length,
    },
    totalUnsynced: unsyncedMetrics.length + unsyncedAppointments.length + 
                   unsyncedMessages.length + unsyncedPrescriptions.length,
  };
}

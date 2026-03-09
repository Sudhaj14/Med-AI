export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  type: 'text' | 'audio';
}

export interface SymptomCheck {
  id: string;
  userId: string;
  symptoms: string[];
  analysis: string;
  suggestedConditions: string[];
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface HealthMetric {
  id: string;
  userId: string;
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar';
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startTime: string;
  nextDose?: Date;
  taken: boolean;
  notes?: string;
  createdAt: Date;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  userId: string;
  reminderTime: string;
  isActive: boolean;
  lastTaken?: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

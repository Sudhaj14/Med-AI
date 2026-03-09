import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationReminder extends Document {
  medicationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reminderTime: string;
  isActive: boolean;
  lastTaken?: Date;
}

const MedicationReminderSchema: Schema = new Schema({
  medicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reminderTime: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastTaken: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.MedicationReminder || mongoose.model<IMedicationReminder>('MedicationReminder', MedicationReminderSchema);

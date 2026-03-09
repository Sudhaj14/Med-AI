import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: string;
  startTime: string;
  nextDose?: Date;
  taken: boolean;
  notes?: string;
  createdAt: Date;
}

const MedicationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  nextDose: {
    type: Date,
  },
  taken: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Medication || mongoose.model<IMedication>('Medication', MedicationSchema);

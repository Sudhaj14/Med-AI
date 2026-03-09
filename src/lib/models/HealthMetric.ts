import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthMetric extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar';
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
}

const HealthMetricSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['weight', 'blood_pressure', 'heart_rate', 'temperature', 'blood_sugar'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.HealthMetric || mongoose.model<IHealthMetric>('HealthMetric', HealthMetricSchema);

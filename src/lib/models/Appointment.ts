import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId;
  doctorId: string;
  doctor: {
    name: string;
    specialization: string;
    experience: number;
    rating: number;
    education: string;
    consultationFee: number;
  };
  date: string;
  time: string;
  reason: string;
  symptoms?: string[];
  healthMetrics?: {
    type: string;
    value: number;
    unit: string;
    timestamp: Date;
  }[];
  chatHistory?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  callStartTime?: Date;
  callEndTime?: Date;
  callDuration?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  doctor: {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    rating: { type: Number, required: true },
    education: { type: String, required: true },
    consultationFee: { type: Number, required: true },
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  symptoms: [{
    type: String,
  }],
  healthMetrics: [{
    type: { type: String },
    value: { type: Number },
    unit: { type: String },
    timestamp: { type: Date },
  }],
  chatHistory: {
    type: String,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  callStartTime: {
    type: Date,
  },
  callEndTime: {
    type: Date,
  },
  callDuration: {
    type: Number, // in minutes
  },
}, {
  timestamps: true,
});

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

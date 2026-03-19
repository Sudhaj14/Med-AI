import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  role: 'patient' | 'doctor';
  specialization?: string;
  experience?: number;
  consultationFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function() {
      return this.role === 'patient'; // Password required for patients, OAuth for doctors
    },
  },
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true,
    default: 'patient',
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
  },
  experience: {
    type: Number,
    required: function() {
      return this.role === 'doctor';
    },
  },
  consultationFee: {
    type: Number,
    required: function() {
      return this.role === 'doctor';
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

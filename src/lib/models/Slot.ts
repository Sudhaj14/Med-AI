import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  isBooked: boolean;
  patientId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema: Schema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
SlotSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);

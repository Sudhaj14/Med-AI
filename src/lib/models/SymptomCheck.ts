import mongoose, { Schema, Document } from 'mongoose';

export interface ISymptomCheck extends Document {
  userId: mongoose.Types.ObjectId;
  symptoms: string[];
  analysis: string;
  suggestedConditions: string[];
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const SymptomCheckSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symptoms: [{
    type: String,
    required: true,
  }],
  analysis: {
    type: String,
    required: true,
  },
  suggestedConditions: [{
    type: String,
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

export default mongoose.models.SymptomCheck || mongoose.model<ISymptomCheck>('SymptomCheck', SymptomCheckSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine {
  name: string;
  quantity: number;
  price: number;
  manufacturer: string;
  category: string;
  prescriptionRequired: boolean;
}

export interface IPharmacy extends Document {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  medicines: IMedicine[];
  licenseNumber: string;
  operatingHours: {
    open: string;
    close: string;
  };
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  manufacturer: { type: String, required: true },
  category: { type: String, required: true },
  prescriptionRequired: { type: Boolean, default: false },
});

const PharmacySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  medicines: [MedicineSchema],
  licenseNumber: {
    type: String,
    required: true,
  },
  operatingHours: {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for searching medicines
PharmacySchema.index({ 'medicines.name': 'text' });
PharmacySchema.index({ 'address.city': 1 });
PharmacySchema.index({ 'address.pincode': 1 });

export default mongoose.models.Pharmacy || mongoose.model<IPharmacy>('Pharmacy', PharmacySchema);

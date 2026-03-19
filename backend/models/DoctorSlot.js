const mongoose = require('mongoose');

const doctorSlotSchema = new mongoose.Schema({
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Storing date as YYYY-MM-DD
    required: true,
  },
  time_slot: {
    type: String, // String representation e.g. '10:00 AM - 10:30 AM'
    required: true,
  },
  is_booked: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Ensure a doctor can't have duplicate slots for the same date and time
doctorSlotSchema.index({ doctor_id: 1, date: 1, time_slot: 1 }, { unique: true });

module.exports = mongoose.model('DoctorSlot', doctorSlotSchema);

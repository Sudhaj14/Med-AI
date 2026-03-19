const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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
    type: String, // Storing time slot e.g., '10:00 AM - 10:30 AM'
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  rejection_reason: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

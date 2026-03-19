const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');
const DoctorSlot = require('../models/DoctorSlot');
const Appointment = require('../models/Appointment');

const router = express.Router();

// All routes require patient role
router.use(authMiddleware, roleMiddleware(['patient']));

// @route   GET /api/patient/doctors
// @desc    Get list of all doctors (with optional specialization filter)
// @access  Patient
router.get('/doctors', async (req, res) => {
  try {
    const filter = { role: 'doctor' };
    if (req.query.specialization) {
      filter.specialization = { $regex: new RegExp(req.query.specialization, 'i') };
    }

    const doctors = await User.find(filter).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/patient/doctors/:id/slots
// @desc    Get available slots for a specific doctor
// @access  Patient
router.get('/doctors/:id/slots', async (req, res) => {
  try {
    const slots = await DoctorSlot.find({ doctor_id: req.params.id, is_booked: false }).sort('date time_slot');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/patient/appointments
// @desc    Book an appointment from an available slot
// @access  Patient
router.post('/appointments', async (req, res) => {
  const { doctor_id, date, time_slot } = req.body;

  if (!doctor_id || !date || !time_slot) {
    return res.status(400).json({ message: 'doctor_id, date, and time_slot are required' });
  }

  try {
    // 1. Check if the slot exists and is available using findOneAndUpdate to avoid race conditions
    const slot = await DoctorSlot.findOneAndUpdate(
      { doctor_id, date, time_slot, is_booked: false },
      { is_booked: true },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({ message: 'Slot already booked or not available' });
    }

    // 2. Create the pending appointment
    const appointment = new Appointment({
      patient_id: req.user.id,
      doctor_id,
      date,
      time_slot,
      status: 'pending' // Doctor must accept
    });

    await appointment.save();

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/patient/appointments
// @desc    View all my booked appointments (pending, accepted, rejected)
// @access  Patient
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient_id: req.user.id })
      .populate('doctor_id', 'name email specialization')
      .sort('-createdAt');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

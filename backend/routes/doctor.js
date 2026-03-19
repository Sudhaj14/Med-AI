const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const DoctorSlot = require('../models/DoctorSlot');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const router = express.Router();

// All routes require doctor role
router.use(authMiddleware, roleMiddleware(['doctor']));

// @route   POST /api/doctor/slots
// @desc    Add available time slots
// @access  Doctor
router.post('/slots', async (req, res) => {
  const { date, time_slots } = req.body; // time_slots array e.g., ['10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM']

  if (!date || !time_slots || !Array.isArray(time_slots)) {
    return res.status(400).json({ message: 'Date and an array of time_slots are required' });
  }

  try {
    const slotsToInsert = time_slots.map(slot => ({
      doctor_id: req.user.id,
      date,
      time_slot: slot,
    }));

    // Use insertMany with ordered: false to ignore duplicates naturally
    const result = await DoctorSlot.insertMany(slotsToInsert, { ordered: false }).catch(err => {
      // Ignore duplicate key errors (code 11000), return successfully inserted ones
      if (err.code === 11000) {
        return err.insertedDocs;
      }
      throw err;
    });

    res.status(201).json({ message: 'Slots added', slots: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/doctor/slots
// @desc    View my available/booked slots
// @access  Doctor
router.get('/slots', async (req, res) => {
  try {
    const slots = await DoctorSlot.find({ doctor_id: req.user.id }).sort('date time_slot');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/doctor/slots/:id
// @desc    Remove an available slot
// @access  Doctor
router.delete('/slots/:id', async (req, res) => {
  try {
    const slot = await DoctorSlot.findOne({ _id: req.params.id, doctor_id: req.user.id });

    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.is_booked) return res.status(400).json({ message: 'Cannot delete a booked slot' });

    await DoctorSlot.deleteOne({ _id: req.params.id });
    res.json({ message: 'Slot removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/doctor/appointments
// @desc    View all incoming appointment requests for the doctor
// @access  Doctor
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor_id: req.user.id })
      .populate('patient_id', 'name email')
      .sort('-createdAt');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/doctor/appointments/:id
// @desc    Accept or reject an appointment request
// @access  Doctor
router.put('/appointments/:id', async (req, res) => {
  const { status, rejection_reason } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected.' });
  }

  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor_id: req.user.id });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Once it is processed from pending, generally shouldn't allow changing back without care, but we will allow updates.
    appointment.status = status;
    
    if (status === 'rejected') {
      appointment.rejection_reason = rejection_reason || 'Doctor unavailable';
      
      // If rejected, free up the slot
      await DoctorSlot.findOneAndUpdate(
        { doctor_id: appointment.doctor_id, date: appointment.date, time_slot: appointment.time_slot },
        { is_booked: false }
      );
    } else {
      // If accepted, ensure it was properly booked (it should already be marked is_booked when patient requested it initially pending)
      appointment.rejection_reason = undefined;
    }

    await appointment.save();

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

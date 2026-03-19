const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medical-chatbot';

// Socket.IO (WebRTC signaling)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || true,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  // Join per-appointment room so signaling is scoped to one session.
  socket.on('join-appointment', ({ appointmentId, role }) => {
    if (!appointmentId) return;
    socket.join(String(appointmentId));
    socket.to(String(appointmentId)).emit('peer-joined', { role });
  });

  // Relay WebRTC SDP/ICE payloads between doctor/patient in same room.
  socket.on('signal', ({ appointmentId, signalData, senderRole }) => {
    if (!appointmentId || !signalData) return;
    socket.to(String(appointmentId)).emit('signal', { signalData, senderRole });
  });

  socket.on('leave-appointment', ({ appointmentId, role }) => {
    if (!appointmentId) return;
    socket.leave(String(appointmentId));
    socket.to(String(appointmentId)).emit('peer-left', { role });
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

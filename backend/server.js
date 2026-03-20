const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.SOCKET_PORT || process.env.PORT || 5000;
const HOST = process.env.SOCKET_HOST || '0.0.0.0';

const SOCKET_IO_PATH = process.env.SOCKET_IO_PATH || '/socket.io';
const SOCKET_CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || '*';
const SOCKET_CORS_CREDENTIALS = SOCKET_CORS_ORIGIN !== '*';

const httpServer = http.createServer();

const io = new Server(httpServer, {
  path: SOCKET_IO_PATH,
  cors: {
    origin: SOCKET_CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: SOCKET_CORS_CREDENTIALS,
  },
  transports: ['websocket', 'polling'],
});

function roomName(appointmentId) {
  return `appointment:${appointmentId}`;
}

io.on('connection', (socket) => {
  console.log(`[socket.io] connected: id=${socket.id}`);

  socket.on('join-appointment', ({ appointmentId, role }) => {
    if (!appointmentId) return;
    const room = roomName(appointmentId);
    socket.data.appointmentId = appointmentId;
    socket.data.role = role;
    socket.join(room);
    console.log(
      `[socket.io] join-appointment: id=${socket.id} room=${room} role=${role || 'unknown'}`
    );
  });

  socket.on('leave-appointment', ({ appointmentId }) => {
    if (!appointmentId) return;
    const room = roomName(appointmentId);
    socket.leave(room);
    console.log(`[socket.io] leave-appointment: id=${socket.id} room=${room}`);
  });

  socket.on('signal', ({ appointmentId, signalData, senderRole }) => {
    if (!appointmentId || !signalData) return;
    const room = roomName(appointmentId);

    // Forward to everyone else in the room (client also filters by senderRole).
    socket.to(room).emit('signal', { signalData, senderRole });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[socket.io] disconnected: id=${socket.id} reason=${reason}`);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(
    `[socket.io] server listening on ${HOST}:${PORT} path=${SOCKET_IO_PATH}`
  );
});


const { Server } = require('socket.io');
const socketService = require('../services/socketService');

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST']
    }
  });

  // تفويض معالجة الأحداث إلى خدمة Socket
  io.on('connection', (socket) => socketService.handleConnection(socket, io));

  return io;
}

module.exports = setupSocketIO;
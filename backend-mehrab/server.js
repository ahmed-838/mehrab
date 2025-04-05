const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const setupSocketIO = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { Server } = require('socket.io');

// تهيئة البيئة
dotenv.config();
const app = express();

// الإعدادات الأساسية
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// الاتصال بقاعدة البيانات
connectDB();

// المسارات
const voiceRoomRoutes = require('./routes/voice-room');
app.use('/api/voice-rooms', voiceRoomRoutes);

// معالج الأخطاء
app.use(errorHandler);

// إضافة معالج أخطاء عام
app.use((err, req, res, next) => {
  logger.error(`خطأ عام في الخادم: ${JSON.stringify({ error: err.message })}`);
  res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
});

// إضافة معالج للطلبات غير الموجودة
app.use((req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' });
});

// إنشاء خادم HTTP
const server = http.createServer(app);

// إعداد Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', socket => {
  socket.on('join-room', (userData) => {
    const { roomId, userId, username, isMuted, isDeafened, withoutMic } = userData;
    
    // إضافة المستخدم إلى الغرفة
    const user = {
      id: userId,
      socketId: socket.id,
      username,
      isMuted: withoutMic ? true : isMuted,
      isDeafened,
      isSpeaking: false,
      withoutMic: !!withoutMic
    };
    
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
    
    socket.on('sending-signal', payload => {
      io.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerId: payload.callerId });
    });
    
    socket.on('returning-signal', payload => {
      io.to(payload.callerId).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
    });
    
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
    
    socket.on('leave-room', () => {
      socket.to(roomId).emit('user-disconnected', userId);
      socket.leave(roomId);
    });
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`server is running on port ${PORT} (HTTP)`);
});


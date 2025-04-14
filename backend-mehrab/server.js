const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const setupSocketIO = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { Server } = require('socket.io');
const VoiceRoom = require('./models/VoiceRoom');

dotenv.config();
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

connectDB();

const voiceRoomRoutes = require('./routes/voice-room');
app.use('/api/voice-rooms', voiceRoomRoutes);

app.use(errorHandler);

app.use((err, req, res, next) => {
  logger.error(`خطأ عام في الخادم: ${JSON.stringify({ error: err.message })}`);
  res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// تخزين معلومات المستخدمين المتصلين
const connectedUsers = {};
const userRooms = {};
const userSocketIds = {}; // لتخزين مفاتيح Socket.IO للمستخدمين حسب userId

io.on('connection', socket => {
  console.log('New client connected:', socket.id);
  
  // عندما ينضم مستخدم إلى غرفة
  socket.on('join-room', async (userData) => {
    const { roomId, userId, username, isMuted, isDeafened } = userData;
    
    const user = {
      id: userId,
      socketId: socket.id,
      username,
      isMuted: isMuted || false,
      isDeafened: isDeafened || false,
      isSpeaking: false
    };
    
    // تسجيل المستخدم في القوائم
    connectedUsers[socket.id] = user;
    userRooms[socket.id] = roomId;
    userSocketIds[userId] = socket.id; // تخزين مفتاح Socket.IO للمستخدم
    
    // الانضمام إلى الغرفة
    socket.join(roomId);
    
    try {
      // جلب معلومات الغرفة من قاعدة البيانات
      const room = await VoiceRoom.findById(roomId);
      
      if (room) {
        // تحديث المشاركين في الغرفة إذا لم يكن المستخدم موجودًا بالفعل
        const existingParticipant = room.participants.find(p => p.userId === userId);
        if (!existingParticipant) {
          room.participants.push({
            userId,
            username,
            isMuted: isMuted || false,
            isDeafened: isDeafened || false,
            isSpeaking: false
          });
          await room.save();
        }
        
        // تحويل المشاركين إلى التنسيق المطلوب للواجهة
        const participants = room.participants.map(p => ({
          userId: p.userId,
          username: p.username,
          isMuted: p.isMuted,
          isDeafened: p.isDeafened,
          isSpeaking: p.isSpeaking
        }));
        
        // إرسال معلومات المشاركين للمستخدم الجديد
        socket.emit('participants-updated', participants);
        
        // إعلام باقي المستخدمين بانضمام مستخدم جديد
        socket.to(roomId).emit('user-connected', { userId, username, socketId: socket.id });
        socket.to(roomId).emit('participants-updated', participants);
        
        console.log(`User ${username} (${userId}) joined room ${roomId}`);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  });
    
  // استقبال إشارات WebRTC من المستخدمين
  socket.on('sending-signal', (payload) => {
    const { userToSignal, callerId, signal } = payload;
    
    // الحصول على مفتاح Socket.IO للمستخدم المقصود
    const targetSocketId = userSocketIds[userToSignal];
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('user-joined', { signal, callerId });
      console.log(`Signal sent from ${callerId} to ${userToSignal}`);
    } else {
      console.error(`Can't find socket id for user ${userToSignal}`);
    }
  });
  
  socket.on('returning-signal', (payload) => {
    const { signal, callerId } = payload;
    
    // الحصول على مفتاح Socket.IO للمستخدم الذي بدأ الاتصال
    const targetSocketId = userSocketIds[callerId];
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('receiving-returned-signal', { 
        signal, 
        id: connectedUsers[socket.id].id 
      });
      console.log(`Return signal sent from ${connectedUsers[socket.id].id} to ${callerId}`);
    } else {
      console.error(`Can't find socket id for caller ${callerId}`);
    }
  });
  
  // تحديث حالة المستخدم (ميكروفون، سماعة، تحدث)
  socket.on('update-status', async (statusData) => {
    const { isMuted, isDeafened, isSpeaking } = statusData;
    const currentRoomId = userRooms[socket.id];
    const currentUser = connectedUsers[socket.id];
    
    if (currentRoomId && currentUser) {
      try {
        // تحديث حالة المستخدم في الذاكرة
        if (isMuted !== undefined) currentUser.isMuted = isMuted;
        if (isDeafened !== undefined) currentUser.isDeafened = isDeafened;
        if (isSpeaking !== undefined) currentUser.isSpeaking = isSpeaking;
        
        // تحديث حالة المستخدم في قاعدة البيانات
        const room = await VoiceRoom.findById(currentRoomId);
        
        if (room) {
          const participant = room.participants.find(p => p.userId === currentUser.id);
          
          if (participant) {
            if (isMuted !== undefined) participant.isMuted = isMuted;
            if (isDeafened !== undefined) participant.isDeafened = isDeafened;
            if (isSpeaking !== undefined) participant.isSpeaking = isSpeaking;
            
            await room.save();
            
            // إرسال المعلومات المحدثة لجميع المستخدمين في الغرفة
            const updatedParticipants = room.participants.map(p => ({
              userId: p.userId,
              username: p.username,
              isMuted: p.isMuted,
              isDeafened: p.isDeafened,
              isSpeaking: p.isSpeaking
            }));
            
            io.to(currentRoomId).emit('participants-updated', updatedParticipants);
            
            // إذا تم تغيير حالة التحدث، أرسل إشعارًا خاصًا بذلك
            if (isSpeaking !== undefined) {
              io.to(currentRoomId).emit('user-speaking-changed', {
                userId: currentUser.id,
                isSpeaking
              });
            }
          }
        }
      } catch (error) {
        console.error('Error updating participant status:', error);
      }
    }
  });
  
  // عندما يغادر مستخدم الغرفة
  socket.on('leave-room', async () => {
    const roomId = userRooms[socket.id];
    const user = connectedUsers[socket.id];
    
    if (roomId && user) {
      try {
        // تحديث قاعدة البيانات
        const room = await VoiceRoom.findById(roomId);
        
        if (room) {
          // إزالة المستخدم من الغرفة
          room.participants = room.participants.filter(p => p.userId !== user.id);
          await room.save();
          
          // إرسال المعلومات المحدثة للمستخدمين المتبقين
          const updatedParticipants = room.participants.map(p => ({
            userId: p.userId,
            username: p.username,
            isMuted: p.isMuted,
            isDeafened: p.isDeafened,
            isSpeaking: p.isSpeaking
          }));
          
          socket.to(roomId).emit('user-disconnected', user.id);
          socket.to(roomId).emit('participants-updated', updatedParticipants);
          
          console.log(`User ${user.username} (${user.id}) left room ${roomId}`);
        }
      } catch (error) {
        console.error('Error updating room on user leave:', error);
      }
      
      // مغادرة الغرفة
      socket.leave(roomId);
      
      // تنظيف البيانات
      delete userSocketIds[user.id];
      delete userRooms[socket.id];
      delete connectedUsers[socket.id];
    }
  });
  
  // معالجة قطع الاتصال
  socket.on('disconnect', async () => {
    const roomId = userRooms[socket.id];
    const user = connectedUsers[socket.id];
    
    if (roomId && user) {
      try {
        // تحديث قاعدة البيانات
        const room = await VoiceRoom.findById(roomId);
        
        if (room) {
          // إزالة المستخدم من الغرفة
          room.participants = room.participants.filter(p => p.userId !== user.id);
          await room.save();
          
          // إرسال المعلومات المحدثة للمستخدمين المتبقين
          const updatedParticipants = room.participants.map(p => ({
            userId: p.userId,
            username: p.username,
            isMuted: p.isMuted,
            isDeafened: p.isDeafened,
            isSpeaking: p.isSpeaking
          }));
          
          socket.to(roomId).emit('user-disconnected', user.id);
          socket.to(roomId).emit('participants-updated', updatedParticipants);
          
          console.log(`User ${user.username} (${user.id}) disconnected from room ${roomId}`);
        }
      } catch (error) {
        console.error('Error updating room on disconnect:', error);
      }
      
      // تنظيف البيانات
      delete userSocketIds[user.id];
      delete userRooms[socket.id];
      delete connectedUsers[socket.id];
    }
    
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`server is running on port ${PORT} (HTTP)`);
});


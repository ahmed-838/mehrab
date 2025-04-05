const webrtcService = require('./webrtc');
const logger = require('../utils/logger');
const VoiceRoom = require('../models/VoiceRoom');

/**
 * معالجة اتصال المستخدم بالسوكت
 * @param {Socket} socket - كائن السوكت
 * @param {Server} io - خادم السوكت
 */
function handleConnection(socket, io) {
  logger.info(`مستخدم متصل: ${socket.id}`);
  
  socket.on('join-room', async (roomId, userId, username) => {
    try {
      // التحقق من وجود الغرفة في قاعدة البيانات
      const room = await VoiceRoom.findById(roomId);
      if (!room) {
        socket.emit('error', 'الغرفة غير موجودة');
        return;
      }
      
      // الانضمام إلى الغرفة
      socket.join(roomId);
      
      // إضافة المستخدم إلى قائمة المشاركين في قاعدة البيانات إذا لم يكن موجودًا بالفعل
      const existingParticipant = room.participants.find(p => p.userId === userId);
      if (!existingParticipant) {
        room.participants.push({
          userId,
          username: username || `مستخدم-${userId.substring(0, 3)}`,
          avatar: 'default-avatar.png',
          isMuted: true,
          isDeafened: false,
          isSpeaking: false
        });
        await room.save();
      }
      
      // إرسال إشعار للمستخدمين الآخرين في الغرفة
      socket.to(roomId).emit('user-connected', userId, username);
      
      logger.info(`المستخدم ${username} (${userId}) انضم إلى الغرفة ${roomId}`);
      
      // إنشاء اتصال WebRTC
      webrtcService.createPeerConnection(userId, roomId);
      
      // معالجة مغادرة الغرفة
      socket.on('leave-room', async (roomId, userId) => {
        handleUserLeaving(socket, roomId, userId, username);
      });
      
      // عند قطع الاتصال
      socket.on('disconnect', async () => {
        handleUserLeaving(socket, roomId, userId, username);
      });
    } catch (error) {
      logger.error(`خطأ في معالجة انضمام المستخدم إلى الغرفة: ${error.message}`);
      socket.emit('error', 'حدث خطأ أثناء الانضمام إلى الغرفة');
    }
  });
  
  // معالجة أحداث الصوت
  handleAudioEvents(socket);
  
  // معالجة أحداث WebRTC
  handleWebRTCEvents(socket);
}

/**
 * معالجة مغادرة المستخدم للغرفة
 * @param {Socket} socket - كائن السوكت
 * @param {string} roomId - معرف الغرفة
 * @param {string} userId - معرف المستخدم
 * @param {string} username - اسم المستخدم
 */
async function handleUserLeaving(socket, roomId, userId, username) {
  socket.to(roomId).emit('user-disconnected', userId);
  logger.info(`المستخدم ${username} (${userId}) غادر الغرفة ${roomId}`);
  
  // إغلاق اتصال WebRTC
  webrtcService.closePeerConnection(userId, roomId);
  
  // تحديث قاعدة البيانات
  try {
    await VoiceRoom.findByIdAndUpdate(roomId, {
      $pull: { participants: { userId: userId } }
    });
  } catch (error) {
    logger.error(`خطأ في تحديث المشاركين عند المغادرة: ${error.message}`);
  }
}

/**
 * معالجة أحداث الصوت
 * @param {Socket} socket - كائن السوكت
 */
function handleAudioEvents(socket) {
  // بدء التحدث
  socket.on('start-speaking', (roomId, userId) => {
    socket.to(roomId).emit('user-speaking', userId);
  });
  
  // إيقاف التحدث
  socket.on('stop-speaking', (roomId, userId) => {
    socket.to(roomId).emit('user-stopped-speaking', userId);
  });
  
  // كتم/إلغاء كتم الصوت
  socket.on('toggle-mute', async (roomId, userId, isMuted) => {
    socket.to(roomId).emit('user-mute-changed', userId, isMuted);
    
    // تحديث حالة المستخدم في قاعدة البيانات
    try {
      await VoiceRoom.findOneAndUpdate(
        { _id: roomId, 'participants.userId': userId },
        { $set: { 'participants.$.isMuted': isMuted } }
      );
    } catch (error) {
      logger.error(`خطأ في تحديث حالة كتم الصوت: ${error.message}`);
    }
  });
  
  // تعطيل/تفعيل السماعة
  socket.on('toggle-deafen', async (roomId, userId, isDeafened) => {
    socket.to(roomId).emit('user-deafen-changed', userId, isDeafened);
    
    // تحديث حالة المستخدم في قاعدة البيانات
    try {
      await VoiceRoom.findOneAndUpdate(
        { _id: roomId, 'participants.userId': userId },
        { $set: { 'participants.$.isDeafened': isDeafened } }
      );
    } catch (error) {
      logger.error(`خطأ في تحديث حالة تعطيل السماعة: ${error.message}`);
    }
  });
}

/**
 * معالجة أحداث WebRTC
 * @param {Socket} socket - كائن السوكت
 */
function handleWebRTCEvents(socket) {
  // إرسال إشارة
  socket.on('sending-signal', (payload) => {
    socket.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerId: payload.callerId });
  });
  
  // إعادة إشارة
  socket.on('returning-signal', (payload) => {
    socket.to(payload.callerId).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
  });
}

module.exports = {
  handleConnection
};
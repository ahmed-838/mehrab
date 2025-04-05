const VoiceRoom = require('../models/VoiceRoom');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

/**
 * الحصول على جميع الغرف الصوتية
 * @param {Request} req - طلب HTTP
 * @param {Response} res - استجابة HTTP
 */
async function getAllRooms(req, res) {
  try {
    const rooms = await VoiceRoom.find();
    res.json(rooms);
  } catch (error) {
    logger.error(`خطأ في الحصول على جميع الغرف: ${JSON.stringify({ error })}`);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
}

/**
 * إنشاء غرفة صوتية جديدة
 * @param {Request} req - طلب HTTP
 * @param {Response} res - استجابة HTTP
 */
async function createRoom(req, res) {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'اسم الغرفة مطلوب' });
    }
    
    const newRoom = new VoiceRoom({
      name,
      description: description || '',
      participants: []
    });
    
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    logger.error(`خطأ في إنشاء غرفة: ${JSON.stringify({ error })}`);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
}

/**
 * الحصول على غرفة صوتية محددة
 * @param {Request} req - طلب HTTP
 * @param {Response} res - استجابة HTTP
 */
async function getRoomById(req, res) {
  try {
    const room = await VoiceRoom.findById(req.params.id).select('-password');
    if (!room) {
      return res.status(404).json({ message: 'الغرفة غير موجودة' });
    }
    res.json(room);
  } catch (error) {
    logger.error(`خطأ في الحصول على الغرفة ${req.params.id}:`, error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الغرفة الصوتية' });
  }
}

/**
 * الانضمام إلى غرفة صوتية
 * @param {Request} req - طلب HTTP
 * @param {Response} res - استجابة HTTP
 */
async function joinRoom(req, res) {
  try {
    const { id } = req.params;
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ message: 'معرف المستخدم واسم المستخدم مطلوبان' });
    }
    
    // التحقق من صحة معرف الغرفة
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'معرف الغرفة غير صالح' });
    }
    
    const room = await VoiceRoom.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'الغرفة غير موجودة' });
    }
    
    // التحقق مما إذا كان المستخدم موجودًا بالفعل في الغرفة
    const existingParticipant = room.participants.find(p => p.userId === userId);
    
    if (existingParticipant) {
      // إذا كان المستخدم موجودًا بالفعل، نعيد معلومات الغرفة فقط
      return res.json(room);
    }
    
    // إضافة المستخدم إلى الغرفة
    room.participants.push({
      userId,
      username,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false
    });
    
    await room.save();
    
    res.json(room);
  } catch (error) {
    logger.error(`خطأ في الانضمام إلى الغرفة ${req.params.id}: ${JSON.stringify({ error })}`);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
}

/**
 * مغادرة غرفة صوتية
 * @param {Request} req - طلب HTTP
 * @param {Response} res - استجابة HTTP
 */
async function leaveRoom(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'معرف المستخدم مطلوب' });
    }
    
    // التحقق من صحة معرف الغرفة
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'معرف الغرفة غير صالح' });
    }
    
    const room = await VoiceRoom.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'الغرفة غير موجودة' });
    }
    
    // إزالة المستخدم من الغرفة
    room.participants = room.participants.filter(p => p.userId !== userId);
    
    await room.save();
    
    res.json(room);
  } catch (error) {
    logger.error(`خطأ في مغادرة الغرفة ${req.params.id}: ${JSON.stringify({ error })}`);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
}

/**
 * تحديث حالة المشارك
 * @param {Request} req - طلب HTTP
 * @param {Response} res - استجابة HTTP
 */
async function updateParticipantStatus(req, res) {
  try {
    const { id } = req.params;
    const { userId, isMuted, isDeafened, isSpeaking } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'معرف المستخدم مطلوب' });
    }
    
    // التحقق من صحة معرف الغرفة
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'معرف الغرفة غير صالح' });
    }
    
    const room = await VoiceRoom.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'الغرفة غير موجودة' });
    }
    
    // تحديث حالة المشارك
    const participant = room.participants.find(p => p.userId === userId);
    
    if (!participant) {
      return res.status(404).json({ message: 'المشارك غير موجود في الغرفة' });
    }
    
    if (isMuted !== undefined) participant.isMuted = isMuted;
    if (isDeafened !== undefined) participant.isDeafened = isDeafened;
    if (isSpeaking !== undefined) participant.isSpeaking = isSpeaking;
    
    await room.save();
    
    res.json(room);
  } catch (error) {
    logger.error(`خطأ في تحديث حالة المشارك في الغرفة ${req.params.id}: ${JSON.stringify({ error })}`);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
}

module.exports = {
  getAllRooms,
  createRoom,
  getRoomById,
  joinRoom,
  leaveRoom,
  updateParticipantStatus
};
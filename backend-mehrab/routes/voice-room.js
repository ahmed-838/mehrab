const express = require('express');
const router = express.Router();
const voiceRoomController = require('../controllers/voiceRoomController');
const mongoose = require('mongoose');
const VoiceRoom = require('../models/VoiceRoom');
const logger = require('../utils/logger');

// الحصول على جميع الغرف الصوتية
router.get('/', voiceRoomController.getAllRooms);

// إنشاء غرفة صوتية جديدة
router.post('/', voiceRoomController.createRoom);

// الحصول على غرفة صوتية محددة
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // التحقق من صحة معرف الغرفة
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'معرف الغرفة غير صالح' });
    }
    
    const room = await VoiceRoom.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'الغرفة غير موجودة' });
    }
    
    res.json(room);
  } catch (error) {
    logger.error(`خطأ في الحصول على الغرفة ${req.params.id}: ${JSON.stringify({ error })}`);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

// الانضمام إلى غرفة صوتية
router.post('/:id/join', voiceRoomController.joinRoom);

// مغادرة غرفة صوتية
router.post('/:id/leave', voiceRoomController.leaveRoom);

// تحديث حالة المشارك (كتم/إلغاء كتم، إلخ)
router.patch('/:id/participant', voiceRoomController.updateParticipantStatus);

module.exports = router;
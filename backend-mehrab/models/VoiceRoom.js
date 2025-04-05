const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isDeafened: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const voiceRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  maxParticipants: {
    type: Number,
    default: 10,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    default: '',
  },
  participants: [participantSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// تحديث وقت التعديل قبل الحفظ
voiceRoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const VoiceRoom = mongoose.model('VoiceRoom', voiceRoomSchema);

module.exports = VoiceRoom; 
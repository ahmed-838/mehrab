// تخزين اتصالات المستخدمين بدون استخدام wrtc
const peerConnections = {};

/**
 * إنشاء اتصال جديد (تسجيل فقط)
 * @param {string} userId - معرف المستخدم
 * @param {string} roomId - معرف الغرفة
 * @returns {Object} - معلومات الاتصال
 */
function createPeerConnection(userId, roomId) {
  console.log(`تم إنشاء اتصال للمستخدم ${userId} في الغرفة ${roomId}`);
  
  // تخزين معرف الاتصال
  peerConnections[`${roomId}-${userId}`] = {
    userId,
    roomId,
    createdAt: new Date()
  };
  
  return peerConnections[`${roomId}-${userId}`];
}

/**
 * الحصول على اتصال موجود
 * @param {string} userId - معرف المستخدم
 * @param {string} roomId - معرف الغرفة
 * @returns {Object|null} - معلومات الاتصال أو null إذا لم يكن موجودًا
 */
function getPeerConnection(userId, roomId) {
  return peerConnections[`${roomId}-${userId}`];
}

/**
 * إغلاق اتصال
 * @param {string} userId - معرف المستخدم
 * @param {string} roomId - معرف الغرفة
 */
function closePeerConnection(userId, roomId) {
  console.log(`تم إغلاق اتصال المستخدم ${userId} في الغرفة ${roomId}`);
  delete peerConnections[`${roomId}-${userId}`];
}

/**
 * الحصول على جميع اتصالات الأقران في غرفة معينة
 * @param {string} roomId - معرف الغرفة
 * @returns {Object} - قائمة باتصالات الأقران في الغرفة
 */
function getRoomPeerConnections(roomId) {
  const roomConnections = {};
  
  Object.keys(peerConnections).forEach(key => {
    if (key.startsWith(`${roomId}-`)) {
      const userId = key.split('-')[1];
      roomConnections[userId] = peerConnections[key];
    }
  });
  
  return roomConnections;
}

module.exports = {
  createPeerConnection,
  getPeerConnection,
  closePeerConnection,
  getRoomPeerConnections
}; 
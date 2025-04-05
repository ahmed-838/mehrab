const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('خطأ في الخادم:', err);
  
  res.status(500).json({
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;

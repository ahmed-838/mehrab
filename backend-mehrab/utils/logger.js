const winston = require('winston');
const fs = require('fs');
const path = require('path');

// إنشاء مجلد للسجلات إذا لم يكن موجوداً
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// تكوين Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `[${level.toUpperCase()}] ${timestamp}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    // سجل المعلومات والتحذيرات في ملف info.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'info.log'), 
      level: 'info' 
    }),
    // سجل الأخطاء في ملف error.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    // عرض جميع السجلات في وحدة التحكم أيضاً
    new winston.transports.Console()
  ],
});

function info(message) {
  logger.info(message);
}

function error(message, err) {
  logger.error(message, { error: err });
}

function warn(message) {
  logger.warn(message);
}

module.exports = {
  info,
  error,
  warn
};
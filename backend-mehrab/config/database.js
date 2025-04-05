const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        logger.error('MONGO_URI is not defined');
        console.log('MONGO_URI is not defined');
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
        logger.info('database connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        logger.error('error in database connection:', error);
        process.exit(1);
    }
}

module.exports = connectDB; 
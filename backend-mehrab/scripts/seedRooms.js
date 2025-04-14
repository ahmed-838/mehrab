const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VoiceRoom = require('../models/VoiceRoom');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

// Seed data
const roomsData = [
  {
    name: 'حلقة الشيخ حسني',
    description: 'حلقة أسبوعية لتحفيظ سورة البقرة مع التفسير المبسط',
    maxParticipants: 20,
    isPrivate: false,
    createdBy: 'admin',
    participants: []
  },
  {
    name: 'حلقة الشيخ عبد الكريم',
    description: 'تعلم أساسيات التجويد وأحكام النون الساكنة والتنوين',
    maxParticipants:20,
    isPrivate: false,
    createdBy: 'admin',
    participants: []
  },
];

// Seed the database
const seedDB = async () => {
  try {
    // Clear existing rooms
    await VoiceRoom.deleteMany({});
    console.log('Cleared existing voice rooms');
    
    // Insert new rooms
    const createdRooms = await VoiceRoom.insertMany(roomsData);
    console.log(`Created ${createdRooms.length} voice rooms:`);
    
    createdRooms.forEach(room => {
      console.log(`- ID: ${room._id}, Name: ${room.name}`);
    });
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

// Run the seeding process
connectDB().then(() => {
  seedDB();
}); 
const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_pharmacy';
  
  try {
    // Attempt standard connection with a quick serverSelectionTimeoutMS
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB Warning] Could not connect to external MongoDB at ${uri} (${err.message})`);
    console.log('[MongoDB Fallback] Initializing embedded MongoDB engine for seamless standalone operation...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'smart_pharmacy'
        }
      });
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB Embedded] In-Memory MongoDB connected at ${memUri}`);
      
      // Auto seed when running embedded if empty
      const User = require('../models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        const { seedDatabase } = require('../utils/seedData');
        await seedDatabase();
      }
      
      return conn;
    } catch (memErr) {
      console.error('[MongoDB Error] Failed to start embedded MongoDB:', memErr.message);
      throw memErr;
    }
  }
};

module.exports = connectDB;

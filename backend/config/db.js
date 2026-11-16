const mongoose = require('mongoose');

let mongodInstance = null;

/**
 * Connect to MongoDB with automatic in-memory fallback.
 * Allows instant out-of-the-box operation even if local MongoDB service isn't running.
 */
const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doubtconnect';

  try {
    // Attempt connecting to the configured MongoDB URI with a short 3s server selection timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at: ${primaryUri}`);
    return;
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${primaryUri}): ${err.message}`);
    console.log('[Database] Initializing MongoDB Memory Server for zero-config demonstration mode...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();

    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to In-Memory MongoDB successfully!`);
    console.log(`[Database] In-memory URI: ${memoryUri}`);

    // Automatically seed data into in-memory database
    const { autoSeedIfEmpty } = require('../seed/seedData');
    await autoSeedIfEmpty();
  } catch (memErr) {
    console.error('[Database] Failed to initialize in-memory MongoDB:', memErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (e) {
    console.error('Error disconnecting database:', e);
  }
};

module.exports = { connectDB, disconnectDB };

import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_connect';
  
  // Try connecting to provided MONGO_URI first with a short timeout
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${uri}): ${err.message}`);
    console.log('[MongoDB] Booting fallback in-memory MongoDB instance for immediate zero-config execution...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB Memory] Connected to in-memory database at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB Error] Failed to start in-memory MongoDB:', memErr);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

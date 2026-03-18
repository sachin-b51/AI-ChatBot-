const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn) {
    return cachedConn;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    cachedConn = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // In serverless, we don't necessarily want to process.exit(1)
    // as it might be a temporary network blip.
    throw err;
  }
};

module.exports = connectDB;

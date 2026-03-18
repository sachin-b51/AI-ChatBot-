const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // wait only 10s before failing
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error. Possible reasons:');
    console.error('1. Your current IP is NOT whitelisted in MongoDB Atlas.');
    console.error('2. Network/Firewall is blocking the connection.');
    console.error('Error Details:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

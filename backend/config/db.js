const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MONGODB_URI found in environment variables');
      console.log('📝 Using in-memory storage for development');
      console.log('💡 To use MongoDB, add MONGODB_URI to your .env file');
      console.log('   Example: MONGODB_URI=mongodb://localhost:27017/taskflow');
      return null; // Return null to indicate no DB connection
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('📝 Falling back to in-memory storage for development');
    console.log('💡 Check your MONGODB_URI in the .env file');
    
    // Don't exit - continue with in-memory storage
    // process.exit(1);
    return null;
  }
};

module.exports = connectDB;
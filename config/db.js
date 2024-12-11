const mongoose = require('mongoose');

const dbconnect = async () => {
  try {
    const uri = process.env.MONGO_URL; // Get the connection string from .env
    if (!uri) {
      console.error('❌ MongoDB URI is undefined!');
      return;
    }
    await mongoose.connect(uri);  // No need for useNewUrlParser and useUnifiedTopology
    console.log('✅ Connected to MongoDB!');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
  }
};

module.exports = dbconnect;

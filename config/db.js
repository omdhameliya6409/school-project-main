const mongoose = require('mongoose');

const dbconnect = async () => {
  try {
    await mongoose.connect(
      process.env.CONNECTION_STRING, // URI કનેક્શન સ્ટ્રિંગ
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ Error connecting to the database:', error.message);
  }
};

module.exports = dbconnect;

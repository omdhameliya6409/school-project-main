const mongoose = require('mongoose');

const dbconnect = async () => {
  try {
    const connection = await mongoose.connect(process.env['MONGO-URL'], {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "school-project-main", // Add the database name explicitly
    });
    console.log(`✅ Connected to MongoDB: ${connection.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to the database: ${error.message}`);
    process.exit(1); // Stop the process if the database connection fails
  }
};

module.exports = dbconnect;

const mongoose = require('mongoose');

const dbconnect = async () => {
    try {
        const uri = process.env['MONGO-URL'];
        if (!uri) {
            throw new Error("MongoDB connection URI is undefined.");
        }
        await mongoose.connect(uri);  // No need to specify useNewUrlParser and useUnifiedTopology
        console.log("✅ Connected to MongoDB!");
    } catch (error) {
        console.error("❌ Error connecting to the database:", error.message);
        process.exit(1); // Exit the process if DB connection fails
    }
};

module.exports = dbconnect;

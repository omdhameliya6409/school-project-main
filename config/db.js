const mongoose = require('mongoose');

const dbconnect = async () => {
    try {
        const uri = process.env['MONGO-URL']; // Ensure this matches your .env key
        if (!uri) {
            throw new Error("MongoDB connection URI is undefined.");
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB!");
    } catch (error) {
        console.error("❌ Error connecting to the database:", error.message);
        process.exit(1); // Exit the process if DB connection fails
    }
};

module.exports = dbconnect;

const mongoose = require("mongoose");

const dbconnect = async () => {
    // Ensure the CONNECTION_STRING is set properly
    if (!process.env.CONNECTION_STRING) {
        console.error("MongoDB URI is not defined in the environment variables.");
        process.exit(1);  // Exit with failure if the URI is missing
    }

    try {
        // Log the connection string to verify
        console.log("Connecting to MongoDB with URI:", process.env.CONNECTION_STRING);

        // Try connecting to MongoDB
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        process.exit(1);  // Exit with failure code
    }
};

module.exports = dbconnect;


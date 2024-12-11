const mongoose = require("mongoose");

const dbconnect = async () => {
    // Check if the CONNECTION_STRING environment variable is set
    if (!process.env.CONNECTION_STRING) {
        console.error("MongoDB URI is not defined in the environment variables.");
        process.exit(1); // Exit the process with failure code
    }

    try {
        // Try connecting to MongoDB using the URI from the environment variable
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");
    } catch (error) {
        // If there's an error, log it and exit
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure code
    }
};

module.exports = dbconnect;

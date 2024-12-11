const mongoose = require("mongoose");

const dbconnect = async () => {
    if (!process.env.CONNECTION_STRING) {
        console.error("MongoDB URI is not defined in the environment variables.");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB with URI:", process.env.CONNECTION_STRING);

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

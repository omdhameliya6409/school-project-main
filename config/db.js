const mongoose = require("mongoose");
require('dotenv').config(); // Load environment variables from the .env file

const dbconnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure code
    }
};

module.exports = dbconnect;

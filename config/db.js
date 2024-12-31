const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from the .env file

const dbconnect = async () => {
    try {
        // Connect to the MongoDB database using the connection string from the .env file
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(" 🔗 Database connected successfully 🔗");

        // Access the raw MongoDB collection
        const collection = mongoose.connection.collection('attendances');

        // Drop the existing compound index (if exists)
        await collection.dropIndex('admissionNo_1_attendanceDate_1').catch((err) => {
            console.log('No existing index on admissionNo and attendanceDate, skipping drop.');
        });

        // Create the compound unique index on admissionNo and attendanceDate
        await collection.createIndex(
            { admissionNo: 1, attendanceDate: 1 },
            { unique: true }
        );

        console.log("✅ Compound unique index on 'admissionNo' and 'attendanceDate' created successfully");

    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure code
    }
};

module.exports = dbconnect;

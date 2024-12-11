
const fs = require('fs');
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbconnect = require("./config/db"); // Ensure correct path
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const principalRoutes = require('./routes/principalRoutes');
const studentRoutes = require("./routes/studentsRoutes");
const admissionRoutes = require('./routes/admissionRoutes');
const path = require('path');
// Create app instance
const app = express();

// Allowed Origins
const allowedOrigins = [
  "https://ucpthiz.localto.net",
  "http://localhost:4002",
  "http://localhost:3001",
  "http://localhost:3000",
];

// Middleware
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true); // Allow if origin is in the list or if it's a server-to-server request
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//     credentials: true, // Enable credentials for cookies or authorization headers
//   })
// );

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers
}));
// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use(express.json()); // Middleware to parse JSON requests
app.use(principalRoutes);

// Connect to Database
dbconnect(); // Make sure to call the function to establish the connection

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
})


// Routes
app.use("/auth", authRoutes); // Authentication Routes
app.use("/dashboard", dashboardRoutes);
app.use("/students", studentRoutes);
app.use('/Admission', admissionRoutes);

// Start Server
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "192.168.31.130"; // Use HOST from environment variables or fallback

app.listen(PORT,HOST, () => {
  console.log(`🚀 Server is running at http://${HOST}:${PORT}`);
});

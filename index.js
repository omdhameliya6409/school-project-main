const fs = require('fs');
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require('dotenv').config();  // Load environment variables from the .env file

const path = require('path');

const dbconnect = require("./config/db"); // Ensure correct path
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const principalRoutes = require('./routes/principalRoutes');
const studentRoutes = require("./routes/studentsRoutes");
const admissionRoutes = require('./routes/admissionRoutes');

// Create app instance
const app = express();

// Allowed Origins
const allowedOrigins = [
  "https://ucpthiz.localto.net",
  "http://localhost:4002",
  "http://localhost:3001",
  "http://localhost:3000",
];

// Middleware for CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow if origin is in the list or if it's a server-to-server request
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Enable credentials for cookies or authorization headers
  })
);

// Use Helmet for security headers
app.use(helmet());

// Rate limiting middleware (limit to 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(express.json()); // Middleware to parse JSON requests

// Connect to Database
dbconnect(); // Make sure to call the function to establish the connection

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/auth", authRoutes); // Authentication Routes
app.use("/dashboard", dashboardRoutes);
app.use("/students", studentRoutes);
app.use('/Admission', admissionRoutes);
app.use(principalRoutes);

// Test Route
app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

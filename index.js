const fs = require('fs');
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
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
  "https://school-project-main.onrender.com", // Render frontend URL
  "http://localhost:3001", // Local development (frontend running on localhost:3000)
  "http://192.168.31.130:8000", // Allow access from local IP address (your server machine)
  // Add any other allowed origins here
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow if the origin is in the list
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If you're using cookies or authorization headers
  })
);

// Use Helmet for security headers
app.use(helmet());

// // Rate limiting middleware (limit to 100 requests per 15 minutes per IP)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window
// });
// app.use(limiter);

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
app.set('trust proxy', 2); // Trust the second proxy in the chain

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
app.listen(PORT, '0.0.0.0', () => {  // Binding to 0.0.0.0 allows external devices to connect
  console.log(`🚀 Server is running at http://192.168.31.130:${PORT}`);
});

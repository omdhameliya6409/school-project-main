const fs = require('fs');
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require('dotenv').config(); // Load environment variables from the .env file
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
  "http://localhost:5173", // Local development (frontend running on localhost:3001)
  "http://192.168.31.130:8000", // Local IP for server machine
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
    credentials: true, // Allow cookies and authorization headers
  })
);

// Use Helmet for security headers
app.use(helmet());

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(express.json()); // Middleware to parse JSON requests

// Connect to Database
dbconnect(); // Call the function to establish the database connection

// Serve static files (uploads)
app.use('/uploads', express.static(uploadDir));

// Routes
app.use("/auth", authRoutes); // Authentication Routes
app.use("/dashboard", dashboardRoutes);
app.use("/students", studentRoutes);
app.use('/admission', admissionRoutes);
app.use(principalRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
// Error Handling Middleware (global)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { // Bind to 0.0.0.0 to allow external devices to connect
  console.log(`🚀 Server is running at http:localhost:${PORT}`);
});

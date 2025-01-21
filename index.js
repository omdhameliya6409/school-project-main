const fs = require('fs');
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require('dotenv').config(); 
const path = require('path');

const dbconnect = require("./config/db"); 
const authRoutes = require("./routes/authRoutes");
// const dashboardRoutes = require('./routes/dashboardRoutes');
const principalRoutes = require('./routes/principalRoutes');
const studentRoutes = require("./routes/studentsRoutes");
const admissionRoutes = require('./routes/admissionRoutes');
const feeRoutes = require('./routes/feeRoutes');
const bookRoutes = require('./routes/BookRoutes'); 
const liveMeetingRoutes = require("./routes/liveMeetingRoutes");
const liveClassMeetingRoutes = require("./routes/liveClassMeetingRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeOverviewRoutes = require('./routes/feeOverviewRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const classTimetableRoutes = require('./routes/classTimetableRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const AssignmentRoutes = require('./routes/AssignmentRoutes');
const subjectMarksReportRoutes = require("./routes/subjectmarksreportRoutes");
const examgradeRoutes = require("./routes/examgradeRoutes");
const studentprofileRoutes = require('./routes/studentprofileRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const assignmentschedule = require('./routes/assignmentschedule');
// const examgroupRoutes = require('./routes/examgroupRoutes');
const examRoutes = require('./routes/examRoutes'); 

const app = express();

// Allowed Origins
const allowedOrigins = [
  "https://school-project-main.onrender.com", 
  "http://localhost:5173",
  "http://192.168.31.130:8000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); 
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  })
);

app.use(helmet());


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

dbconnect(); 


app.use('/uploads', express.static(uploadDir));

// Routes
app.use("/auth", authRoutes); 
// app.use("/dashboard", dashboardRoutes);
app.use("/students", studentRoutes);
app.use("/studentspanel", studentprofileRoutes);
app.use('/admission/student', admissionRoutes);
// app.use(principalRoutes);
app.use('/', feeRoutes);
app.use('/', feeOverviewRoutes);
app.use('/books', bookRoutes); 
app.use("/livemeeting", liveMeetingRoutes);
app.use("/liveclassmeeting", liveClassMeetingRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/teacher", teacherRoutes);
app.use("/schedule", scheduleRoutes);
app.use('/classTimetable', classTimetableRoutes);
app.use('/subjects', subjectRoutes);
app.use('/password', passwordRoutes);
app.use('/Assignment', AssignmentRoutes);

app.use('/examsschedule', examRoutes);
app.use("/subjectmarksreport", subjectMarksReportRoutes);
app.use("/examgrade", examgradeRoutes);
app.use("/leave", leaveRoutes);
app.use('/assignmentschedule', assignmentschedule);

// app.use('/examgroup', examgroupRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { // Bind to 0.0.0.0 to allow external devices to connect
  console.log(`🚀 Server is running at http:localhost:${PORT}`);
});

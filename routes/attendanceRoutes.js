const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/attendance", async (req, res) => {
  try {
    const { admissionNo, name, section, class: studentClass, attendanceDate, attendanceStatus } = req.body;

    // Validate input
    if (!admissionNo || !attendanceDate || !attendanceStatus) {
      return res.status(400).json({ message: "Admission number, attendance date, and status are required." });
    }

    // Validate attendanceStatus
    if (!["Present", "Absent"].includes(attendanceStatus)) {
      return res.status(400).json({ message: "Attendance status must be either 'Present' or 'Absent'." });
    }

    // You can log the incoming data for debugging
    console.log("Request Body:", req.body);

    // Check if attendance for the given date already exists
    let existingAttendance = await Attendance.findOne({ admissionNo, attendanceDate });

    if (existingAttendance) {
      // If attendance exists, update it
      existingAttendance.attendanceStatus = attendanceStatus;
      await existingAttendance.save();
    } else {
      // If attendance does not exist, create a new record
      const newAttendance = new Attendance({
        admissionNo,
        name,
        section,
        studentClass,
        attendanceDate,
        attendanceStatus,
      });
      await newAttendance.save();
    }

    res.status(200).json({
      message: "Attendance marked successfully.",
    });
  } catch (error) {
    console.error("Error marking attendance:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Get students by class and section
router.get("/students", async (req, res) => {
  try {
    const { class: studentClass, section, attendanceDate } = req.query;

    // Validate required fields
    if (!studentClass || !section) {
      return res.status(400).json({ message: "Class and section are required." });
    }

    // Normalize the class and section to match database format
    const normalizedClass = studentClass.replace("Class ", "").trim();
    const normalizedSection = section.trim();

    // Fetch students based on class and section
    const students = await Student.find(
      {
        class: { $regex: new RegExp(`^${normalizedClass}$`, "i") },
        section: { $regex: new RegExp(`^${normalizedSection}$`, "i") },
        isBlocked: false,
        deleted: false,
      },
      {
        admissionNo: 1,
        name: 1,
        rollNo: 1,
        class: 1,
        section: 1,
        _id: 0,
      }
    );

    // If no students found
    if (!students.length) {
      return res.status(404).json({
        message: `No students found for Class ${studentClass} and Section ${section}.`,
      });
    }

    // If attendanceDate is provided, fetch attendance status for each student
    if (attendanceDate) {
      const attendanceRecords = await Attendance.find({
        attendanceDate: new Date(attendanceDate),
        admissionNo: { $in: students.map((student) => student.admissionNo) },
      });

      // Map attendance status to students
      students.forEach((student) => {
        const attendance = attendanceRecords.find(
          (record) => record.admissionNo === student.admissionNo
        );
        student.attendanceStatus = attendance ? attendance.attendanceStatus : "Absent";
      });
    }

    res.status(200).json({
      message: "Students fetched successfully.",
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});



  module.exports = router;
  
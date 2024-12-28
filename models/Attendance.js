const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  admissionNo: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rollNo: {
    type: String,
    required: true,
    trim: true,
  },
  class: {
    type: String,
    required: true,
    trim: true,
  },
  section: {
    type: String,
    required: true,
    trim: true,
  },
  attendanceStatus: {
    type: String,
    required: true,
    enum: ["Present", "Absent"], // Allowed values
  },
  attendanceDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;

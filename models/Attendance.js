const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  admissionNo: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  attendanceDate: {
    type: Date,
    required: true,
  },
  attendanceStatus: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
});

// Compound index to ensure one attendance per student per date
AttendanceSchema.index({ admissionNo: 1, attendanceDate: 1, class: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

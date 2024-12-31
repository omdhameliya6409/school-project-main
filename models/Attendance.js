const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  class: {
    type: String,
    required: true,
  },
  section: {
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
    enum: ['Present', 'Absent', 'Late'],
  }
});

// Create a compound unique index on admissionNo and attendanceDate
attendanceSchema.index({ admissionNo: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

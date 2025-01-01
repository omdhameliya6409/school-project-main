const mongoose = require('mongoose');

// Define Schedule Schema
const scheduleSchema = new mongoose.Schema({
  teacherId: { type: Number, required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  teacherName: { type: String, required: true },
  room: { 
    type: Number,
    required: true,
    min: 1,  // Room numbers should be between 1 and 20
    max: 20
  },
  class: {
    type: Number,
    required: true,
    enum: [9, 10, 11, 12],  // Allowed classes are 9, 10, 11, and 12
  },
  section: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D'],  // Allowed sections are A, B, C, and D
  },
}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('Schedule', scheduleSchema);

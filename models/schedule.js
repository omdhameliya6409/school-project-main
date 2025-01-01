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
    min: 1, // Room numbers should be between 1 and 20
    max: 20,
  },
  className: { type: Number, required: true },
  section: { type: String, required: true },
  day: { 
    type: String,
    required: true, // Day is required
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Valid days
  },
});

module.exports = mongoose.model('Schedule', scheduleSchema);

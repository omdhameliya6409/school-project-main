const mongoose = require('mongoose');


const scheduleSchema = new mongoose.Schema({
  teacherId: { type: Number, required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  teacherName: { type: String, required: true },
  room: { 
    type: Number,
    required: true,
    min: 1, 
    max: 20,
  },
  className: { type: Number, required: true },
  section: { type: String, required: true },
  day: { 
    type: String,
    required: true, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
});

module.exports = mongoose.model('Schedule', scheduleSchema);

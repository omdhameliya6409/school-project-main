const mongoose = require('mongoose');

const classTimetableSchema = new mongoose.Schema({
  class: { type: String, required: true }, 
  subject: { type: String, required: true }, 
  teacherName: { type: String, required: true },
  time: { type: String, required: true }, 
  room: { type: Number, required: true, min: 1, max: 20 },
  day: { type: String, required: true }, 
  section: { type: String, required: true }, 
});

module.exports = mongoose.model('ClassTimetable', classTimetableSchema);
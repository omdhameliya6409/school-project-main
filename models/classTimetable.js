const mongoose = require('mongoose');

const classTimetableSchema = new mongoose.Schema({
  class: { type: String, required: true }, // e.g., "10"
  subject: { type: String, required: true }, // e.g., "Math"
  teacherName: { type: String, required: true }, // e.g., "Dixit"
  time: { type: String, required: true }, // e.g., "9:30 AM - 10:10 AM"
  room: { type: Number, required: true, min: 1, max: 20 }, // Room number (1 to 20)
  day: { type: String, required: true }, // e.g., "Monday", "Tuesday"
  section: { type: String, required: true }, // Section (e.g., "A", "B")
});

module.exports = mongoose.model('ClassTimetable', classTimetableSchema);
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examType: { type: String, required: true },
  class: { 
    type: String, 
    required: true, 
    enum: ['9', '10', '11', '12'], 
    message: 'Class must be one of 9, 10, 11, or 12' 
  },
  section: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
});


// Ensure uniqueness of a combination of fields
examSchema.index({ examType: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Exam', examSchema);

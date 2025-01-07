const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examType: { 
    type: String, 
    required: [true, 'Exam type is required'] 
  },
  class: { 
    type: String, 
    required: [true, 'Class is required'], 
    enum: ['9', '10', '11', '12'], 
    message: 'Class must be one of 9, 10, 11, or 12' 
  },
  section: { 
    type: String, 
    required: [true, 'Section is required'],
    enum: ['A', 'B', 'C', 'D']
  },
  subject: { 
    type: String, 
    required: [true, 'Subject is required'] 
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'] 
  },
  startTime: { 
    type: String, 
    required: [true, 'Start time is required'] 
  },
  duration: { 
    type: String, 
    required: [true, 'Duration is required'] 
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
});

// Ensure uniqueness of a combination of fields
examSchema.index({ examType: 1, date: 1, startTime: 1, subject: 1 }, { unique: true });


module.exports = mongoose.model('Exam', examSchema);

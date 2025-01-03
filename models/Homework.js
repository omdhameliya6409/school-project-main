const mongoose = require('mongoose');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Regex for YYYY-MM-DD format

const HomeworkSchema = new mongoose.Schema({
  class: { 
    type: String, 
    required: true, 
    enum: ['9', '10', '11', '12'], 
    message: 'Class must be one of 9, 10, 11, or 12' 
  },
  section: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  subjectGroup: { type: String, required: true },
  subject: { type: String, required: true },
  homeworkDate: { 
    type: String, 
    required: true, 
    validate: {
      validator: (value) => dateRegex.test(value),
      message: 'Date must be in the format YYYY-MM-DD',
    },
  },
  submissionDate: { 
    type: String, 
    required: true, 
    validate: {
      validator: (value) => dateRegex.test(value),
      message: 'Date must be in the format YYYY-MM-DD',
    },
  },
  evaluationDate: { 
    type: String, 
    validate: {
      validator: (value) => dateRegex.test(value),
      message: 'Date must be in the format YYYY-MM-DD',
    },
  },
  createdBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Homework', HomeworkSchema);

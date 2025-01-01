// models/Subject.js

const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subject_name: {
    type: String,
    required: [true, 'Subject name is required'],
    unique: true, // Enforce uniqueness at the database level
    trim: true,
  },
  type: {
    type: String,
    enum: {
      values: ['Theory', 'Practical'], // Only allow specific values
      message: 'Type must be either "Theory" or "Practical"',
    },
    required: [true, 'Subject type is required'],
  },
  subject_code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true, // Enforce uniqueness at the database level
    trim: true,
  },
});

// Create a unique index for subject_name and subject_code
SubjectSchema.index({ subject_name: 1 }, { unique: true });
SubjectSchema.index({ subject_code: 1 }, { unique: true });

const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = Subject;

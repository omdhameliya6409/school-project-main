// models/Subject.js

const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subject_name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical'],
    required: true,
  },
  subject_code: {
    type: String,
    required: true,
    unique: true,
  },
});

const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = Subject;

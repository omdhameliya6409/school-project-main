// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  // Add other teacher-specific fields here
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  // other fields like email, etc.
});
const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;

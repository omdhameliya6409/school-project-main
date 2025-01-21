const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: Number, required: true },
  name: { type: String, required: true },
  experience: { type: Number, required: true },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  section: { type: [String], required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['General', 'OBC', 'SC', 'ST'], 
    required: true 
  },
});

module.exports = mongoose.model('Teacher', teacherSchema);


const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionNo: { type: String, required: true, unique: true },
  rollNo: { type: String },
  class: { type: String, required: true },
  section: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  category: { type: String },
  religion: { type: String },
  caste: { type: String },
  mobileNumber: { type: String, required: true },
  email: { type: String },
  admissionDate: { type: Date, required: true },
  photo: { type: String },
  bloodGroup: { type: String },
  house: { type: String },
  height: { type: Number },
  weight: { type: Number },
  measurementDate: { type: Date },
  medicalHistory: { type: String },
  isBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Admission', admissionSchema);

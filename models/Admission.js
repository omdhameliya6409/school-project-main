const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionNo: { type: String, required: true, unique: true },
  rollNo: { type: Number },
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
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Store password directly
  admissionDate: { type: Date, required: true },
  bloodGroup: { type: String },
  house: { type: String },
  height: { type: Number },
  weight: { type: Number },
  measurementDate: { type: Date },
  medicalHistory: { type: String },
  isBlocked: { type: Boolean, default: false },
  feeAmount: {
    type: Number,
    required: true,
    default: 2000, // Default fee amount
  },
});
module.exports = mongoose.model('Admission', admissionSchema);

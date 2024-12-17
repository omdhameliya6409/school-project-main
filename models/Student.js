const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  admissionNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rollNo: { type: Number, required: true },
  class: { type: String, required: true },
  fatherName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  isBlocked: { type: Boolean, default: false }, // Blocked status
  isMultiClass: Boolean,
  deleted: Boolean,
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  section: { type: String, enum: ['A', 'B','C','D'], required: true },
  house: { type: String, enum: ['Red', 'Blue', 'Green', 'Yellow'] },
  houseName: { type: String },
  houseDescription: { type: String },
});

module.exports = mongoose.model("Student", studentSchema);

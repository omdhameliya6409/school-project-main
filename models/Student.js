const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  admissionNo: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  rollNo: { type: Number, required: true },
  class: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  category: { type: String, enum: ['General', 'OBC', 'SC', 'ST'], required: true },
  mobileNumber: { type: Number, required: true },
  isBlocked: { type: Boolean, default: false },
  isMultiClass: Boolean,
  deleted: Boolean,
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  section: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  house: { type: String, enum: ['Red', 'Blue', 'Green', 'Yellow'] },
  houseName: { type: String },
  houseDescription: { type: String },
  feeStatus: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Unpaid' }
});

module.exports = mongoose.model("Student", studentSchema);

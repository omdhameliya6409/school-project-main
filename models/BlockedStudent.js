const mongoose = require('mongoose');

const blockedStudentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Reference to Student collection
  blockReason: { type: String, required: true }, // Reason for blocking
  blockedAt: { type: Date, default: Date.now }, // Date when blocked
});

const BlockedStudent = mongoose.model('BlockedStudent', blockedStudentSchema);

module.exports = BlockedStudent;

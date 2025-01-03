const mongoose = require('mongoose');

const blockedStudentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, 
  blockReason: { type: String, required: true }, 
  blockedAt: { type: Date, default: Date.now }, 
});

const BlockedStudent = mongoose.model('BlockedStudent', blockedStudentSchema);

module.exports = BlockedStudent;

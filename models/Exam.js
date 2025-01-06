const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examGroup: { type: String, required: true },
  examName: { type: String, required: true },
  subject: { type: String, required: true },
  dateFrom: { type: Date, required: true },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  roomNumber: { type: Number },
  marksMax: { type: Number, required: true },
  marksMin: { type: Number, required: true },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
});

// Ensure uniqueness of a combination of fields
examSchema.index({ examName: 1, dateFrom: 1, startTime: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Exam', examSchema);

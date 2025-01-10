const mongoose = require('mongoose');

const studentBookSchema = new mongoose.Schema({
  admissionNo: { type: String, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  collectDate: { type: Date, required: true },
  returnedDate: { type: Date },
  status: { type: String, default: 'Notsubmit' },
  isRead: { type: String, default: 'NotRead' },
});

module.exports = mongoose.model('StudentBook', studentBookSchema);

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  bookNumber: { type: String, required: true, unique: true },
  isbnNumber: { type: String, required: true },
  publisher: { type: String, required: true },
  author: { type: String, required: true },
  subject: { type: String, required: true },
  rackNumber: { type: String, required: true },
  qty: { type: Number, required: true },
  available: { type: Number, required: true },
  price: { type: Number, required: true },
  postDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Book', bookSchema);

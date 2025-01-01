const express = require('express');
const Book = require('../models/book'); // Book Model લોડ કરો
const router = express.Router();

// Add New Book
router.post('/add', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(200).json({ status: 200, message: 'Book added successfully', data: book });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error adding book', error: error.message });
  }
});

// Get All Books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ status: 200, message: 'Books fetched successfully', data: books });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching books', error: error.message });
  }
});

// Update Book by ID
router.put('/update/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ status: 404, message: 'Book not found' });
    res.status(200).json({ status: 200, message: 'Book updated successfully', data: book });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error updating book', error: error.message });
  }
});

// Delete Book by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ status: 404, message: 'Book not found' });
    res.status(200).json({ status: 200, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error deleting book', error: error.message });
  }
});

module.exports = router;

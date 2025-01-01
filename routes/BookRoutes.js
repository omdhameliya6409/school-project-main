// routes/bookRoutes.js
const express = require('express');
const Book = require('../models/book');  // Importing the Book model
const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    // Validate if all required fields are provided
    const { title, description, bookNumber, isbnNumber, publisher, author, subject, rackNumber, qty, available, price } = req.body;

    if (!title || !description || !bookNumber || !isbnNumber || !publisher || !author || !subject || !rackNumber || qty === undefined || available === undefined || !price) {
      return res.status(400).json({ status: 400, message: 'All fields are required' });
    }

    // Create a new book instance
    const book = new Book(req.body);

    // Save the book to the database
    await book.save();

    // Return success response
    res.status(201).json({ status: 201, message: 'Book added successfully', data: book });
  } catch (error) {
    console.error('Error adding book:', error.message);
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

// PUT: Edit (update) a book by MongoDB _id, with title uniqueness check
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;  // Get the book id (MongoDB _id)
    const updatedData = req.body;

    // Check if the title is being updated and if it already exists
    if (updatedData.title) {
      const existingBook = await Book.findOne({ title: updatedData.title });
      
      // If another book with the same title exists and it's not the current book being updated, return an error
      if (existingBook && existingBook._id.toString() !== id) {
        return res.status(400).json({ status: 400, message: 'Title already exists, please choose a different title' });
      }
    }

    // Find the book by MongoDB _id
    const book = await Book.findById(id);

    // If the book does not exist, return 404
    if (!book) {
      return res.status(404).json({ status: 404, message: 'Book not found' });
    }

    // Update the book fields with the data from the request body
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        book[key] = updatedData[key];  // Update each field in the book document
      }
    });

    // Save the updated book
    await book.save();

    // Respond with the updated book
    res.status(200).json({ status: 200, message: 'Book updated successfully', data: book });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ status: 500, message: 'Error updating book', error: error.message });
  }
});

// DELETE: Delete a book by MongoDB _id
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;  // Get the book id (MongoDB _id)

    // Find the book by MongoDB _id
    const book = await Book.findById(id);

    // If the book does not exist, return 404
    if (!book) {
      return res.status(404).json({ status: 404, message: 'Book not found' });
    }

    // Delete the book
    await book.deleteOne();

    // Respond with success message
    res.status(200).json({ status: 200, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ status: 500, message: 'Error deleting book', error: error.message });
  }
});

module.exports = router;

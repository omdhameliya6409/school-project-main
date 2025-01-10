const Book = require('../models/book'); // Import the Book model
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const admissions = require('../models/Admission');
const StudentBook = require('../models/StudentBook');
const mongoose = require('mongoose');
const JWT_SECRET = process.env.JWT_SECRET;
// Add a new book
exports.addBook = async (req, res) => {
  try {
    const { title, description, bookNumber,  author, subject, rackNumber, qty, available, price } = req.body;

    if (!title || !description || !bookNumber  || !author || !subject || !rackNumber || qty === undefined || available === undefined || !price) {
      return res.status(400).json({ status: 400, message: 'All fields are required' });
    }

    const book = new Book(req.body);
    await book.save();

    res.status(200).json({ status: 200, message: 'Book added successfully', data: book });
  } catch (error) {
    console.error('Error adding book:', error.message);
    res.status(500).json({ status: 500, message: 'Error adding book', error: error.message });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ status: 200, message: 'Books fetched successfully', data: books });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching books', error: error.message });
  }
};

// Edit a book by id
exports.editBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (updatedData.title) {
      const existingBook = await Book.findOne({ title: updatedData.title });
      if (existingBook && existingBook._id.toString() !== id) {
        return res.status(400).json({ status: 400, message: 'Title already exists, please choose a different title' });
      }
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ status: 404, message: 'Book not found' });
    }

    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        book[key] = updatedData[key];
      }
    });

    await book.save();
    res.status(200).json({ status: 200, message: 'Book updated successfully', data: book });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ status: 500, message: 'Error updating book', error: error.message });
  }
};

// Delete a book by id
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ status: 404, message: 'Book not found' });
    }

    await book.deleteOne();
    res.status(200).json({ status: 200, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ status: 500, message: 'Error deleting book', error: error.message });
  }
};




// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();  // Fetch all books from the Book model
    res.status(200).json({
      status: 200,
       message: "Books fetched successfully.",
      books,
     
    });
  } catch (error) {
    console.error(error);  // Log the error for debugging
    res.status(500).json({ message: "Error fetching books." });
  }
};

exports.getAllStudentBooks = async (req, res) => {
  try {
    const studentBooks = await StudentBook.find();  // Fetch all student-book records
    
    res.status(200).json({
      message: "Books fetched successfully.",
      studentBooks  // Corrected the variable name to match the one you fetched
    });
  } catch (error) {
    console.error(error);  // Log the error for debugging
    res.status(500).json({ message: "Error fetching student books." });
  }
};


// Return a book
exports.returnBook = async (req, res) => {
  try {
    const student = await Student.findById(req.body.studentId); // Assuming studentId is passed in the body
    const book = await Book.findById(req.params.bookId);

    const borrowedBook = student.borrowedBooks.find(b => b.bookId.toString() === book._id.toString() && b.status === "borrowed");
    if (!borrowedBook) {
      return res.status(400).json({ message: "You have not borrowed this book." });
    }

    borrowedBook.status = "returned";
    borrowedBook.returnDate = new Date();
    book.available += 1;

    await student.save();
    await book.save();

    res.status(200).json({ message: "Book returned successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error returning the book." });
  }
};

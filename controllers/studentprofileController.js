
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const admissions = require('../models/Admission');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const ExamGradeModel = require('../models/ExamGrade');
const Attendance = require('../models/Attendance');
const ClassTimetable = require('../models/classTimetable');
const LiveClassMeeting = require('../models/LiveClassMeeting');
const Leave = require('../models/Leave');
const StudentBook = require('../models/StudentBook');
const Book = require('../models/book');
exports.getStudentProfile = async (req, res) => {
  try {
    const { admissionNo } = req.query; // Get admissionNo from query parameters
    const token = req.headers['authorization']; // Get token from headers

    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    // Extract token and decode to check if email matches
    const rawToken = token.split(' ')[1];  // Extract token from Bearer <token> format
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);  // Verify token using secret
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    console.log('Decoded token:', decoded);  // Debugging output to check token content

    // If token is valid, decoded will contain the user data
    if (!decoded || !decoded.email) {
      return res.status(403).json({ status: 403, message: 'Invalid token or email mismatch.' });
    }

    // Check for teacher access - if user is a teacher, skip email match logic
    if (decoded.teacherAccess|| decoded.principalAccess) {
      // Allow teacher to access the profile without matching the email
      const studentProfile = await admissions.findOne({ admissionNo });

      if (!studentProfile) {
        return res.status(404).json({ status: 404, message: 'Student profile not found.' });
      }

      // Fetch exam details based on student's class and section
      const examSchedule = await Exam.findOne({
        class: studentProfile.class,
        section: studentProfile.section,
      });

      // Fetch ExamGrade details based on student's class and section
      const examGradeDetails = await ExamGradeModel.findOne({
        class: studentProfile.class,
        section: studentProfile.section,
      });

      // Fetch Attendance details based on student's class and section
      const attendanceDetails = await Attendance.findOne({
        class: studentProfile.class,
        section: studentProfile.section,
      });

      // Fetch fee details
      const feeDetails = await Fee.findOne({ admissionNo });

      // Prepare response data
      const responseData = {
        studentProfile,
        feeDetails: feeDetails || null,
        examSchedule: examSchedule || null,
        examGrade: examGradeDetails || null,
        attendance: attendanceDetails || null,
      };

      res.status(200).json({ status: 200, data: responseData });
    } else {
      // For other roles like student and principal, check email match
      const studentProfile = await admissions.findOne({ admissionNo });

      if (!studentProfile) {
        return res.status(404).json({ status: 404, message: 'Student profile not found.' });
      }

      // Log student profile to compare with decoded email
      console.log('Student profile email:', studentProfile.email);

      // Compare email from token with email in student profile
      if (studentProfile.email !== decoded.email) {
        return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
      }

      // Fetch exam details based on student's class and section
      const examSchedule = await Exam.findOne({
        class: studentProfile.class,
        section: studentProfile.section,
      });

      // Fetch ExamGrade details based on student's class and section
      const examGradeDetails = await ExamGradeModel.findOne({
        class: studentProfile.class,
        section: studentProfile.section,
      });

      // Fetch Attendance details based on student's class and section
      const attendanceDetails = await Attendance.findOne({
        class: studentProfile.class,
        section: studentProfile.section,
      });

      // Fetch fee details
      const feeDetails = await Fee.findOne({ admissionNo });

      // Prepare response data
      const responseData = {
        studentProfile,
        feeDetails: feeDetails || null,
        examSchedule: examSchedule || null,
        examGrade: examGradeDetails || null,
        attendance: attendanceDetails || null,
      };

      res.status(200).json({ status: 200, data: responseData });
    }
    
  } catch (error) {
    console.error('Error:', error.message);  // Log error for debugging
    res.status(500).json({ status: 500, message: 'Error fetching student profile, fee, and exam details', error: error.message });
  }
};



// Fee Details Controller
exports.getFeeDetails = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    const feeDetails = await Fee.findOne({ admissionNo });
    if (!feeDetails) {
      return res.status(404).json({ status: 404, message: 'Fee details not found.' });
    }

    res.status(200).json({ status: 200, feeDetails });
  } catch (error) {
    console.error('Error fetching fee details:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching fee details', error: error.message });
  }
};

exports.getExamSchedule = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    const examSchedule = await Exam.findOne({
      class: studentProfile.class,
      section: studentProfile.section,
    });

    if (!examSchedule) {
      return res.status(404).json({ status: 404, message: 'Exam schedule not found.' });
    }

    res.status(200).json({ status: 200, examSchedule });
  } catch (error) {
    console.error('Error fetching exam schedule:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching exam schedule', error: error.message });
  }
};


exports.getExamGrade = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    const examGrade = await ExamGradeModel.findOne({
      class: studentProfile.class,
      section: studentProfile.section,
    });

    if (!examGrade) {
      return res.status(404).json({ status: 404, message: 'Exam grade details not found.' });
    }

    res.status(200).json({ status: 200, examGrade });
  } catch (error) {
    console.error('Error fetching exam grade details:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching exam grade details', error: error.message });
  }
};
exports.getAttendance = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    const attendance = await Attendance.findOne({
      class: studentProfile.class,
      section: studentProfile.section,
    });

    if (!attendance) {
      return res.status(404).json({ status: 404, message: 'Attendance details not found.' });
    }

    res.status(200).json({ status: 200, attendance });
  } catch (error) {
    console.error('Error fetching attendance details:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching attendance details', error: error.message });
  }
};
exports.getClassTimetable = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    const classtimetables = await ClassTimetable.findOne({
      class: studentProfile.class,
      section: studentProfile.section,
    });

    if (!classtimetables) {
      return res.status(404).json({ status: 404, message: 'classtimetables details not found.' });
    }

    res.status(200).json({ status: 200, classtimetables });
  } catch (error) {
    console.error('Error fetching classtimetables details:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching classtimetables details', error: error.message });
  }
};
exports.LiveClassMeeting = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    // Query for LiveClassMeeting based on class and section
    const LiveClassMeetings = await LiveClassMeeting.findOne({
      classes: {
        $elemMatch: {
          class: studentProfile.class,
          section: studentProfile.section,
        },
      },
    });

    if (!LiveClassMeetings) {
      return res.status(404).json({
        status: 404,
        message: `No LiveClassMeeting found for class ${studentProfile.class} and section ${studentProfile.section}.`,
      });
    }

    res.status(200).json({ status: 200, LiveClassMeetings });
  } catch (error) {
    console.error('Error fetching LiveClassMeeting details:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching LiveClassMeeting details', error: error.message });
  }
};

exports.Leave = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    const Leaves = await Leave.find({
      class: studentProfile.class,
      section: studentProfile.section,
    });

    if (!Leaves) {
      return res.status(404).json({ status: 404, message: 'Leaves details not found.' });
    }

    res.status(200).json({ status: 200, Leaves });
  } catch (error) {
    console.error('Error fetching Leaves details:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching Leaves details', error: error.message });
  }
};

exports.getStudentBooks = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    const StudentBooks = await StudentBook.find({ admissionNo });
    if (!StudentBooks) {
      return res.status(404).json({ status: 404, message: 'StudentBooks details not found.' });
    }

    res.status(200).json({ status: 200, StudentBooks });
  } catch (error) {
    console.error('Error fetching StudentBooks details:', error.message);
    res.status(500).json({ status: 500, message: 'Error fetching StudentBooks details', error: error.message });
  }
};

exports.borrowBook = async (req, res) => {
  try {
    const { admissionNo } = req.query; // Admission No from query params
    const { bookId } = req.params;     // Book ID from URL parameters
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    // Find the student profile based on admissionNo
    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    // Initialize borrowedBooks if it's missing
    if (!studentProfile.borrowedBooks) {
      studentProfile.borrowedBooks = [];
    }

    // Check if email matches between the token and the student profile
    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    // Retrieve the book by bookId from params
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(400).json({ message: 'Book not found.' });
    }

    // Check if the book is available for borrowing
    if (book.available <= 0 && req.body.status === 'Notsubmit') {
      return res.status(400).json({ message: 'Book not available for borrowing.' });
    }

    // Extract collectDate, returnedDate, status, and isRead from request body
    const { collectDate, returnedDate, status, isRead } = req.body;

    // Check if the student has already borrowed the same book on the same collectDate
    const existingBorrowedBook = await StudentBook.findOne({
      admissionNo: studentProfile.admissionNo,
      bookId: book._id,
      collectDate: new Date(collectDate).toISOString().split('T')[0], // Use only date (YYYY-MM-DD) part for comparison
    });

    if (existingBorrowedBook) {
      return res.status(400).json({ message: 'This book has already been borrowed by the student on this date.' });
    }

    // Create a new StudentBook entry with the admissionNo
    const studentBook = new StudentBook({
      bookId: book._id,
      admissionNo: studentProfile.admissionNo,  // Add admissionNo here
      collectDate: new Date(collectDate),
      returnedDate: returnedDate ? new Date(returnedDate) : null,
      status: status || 'Notsubmit',
      isRead: isRead || 'NotRead',
    });

    // Save the StudentBook entry
    await studentBook.save();

    // Adjust the book's availability based on the status
    if (status === 'submit') {
      book.available += 1; // Book is being returned, increase availability
    } else {
      book.available -= 1; // Book is borrowed, decrease availability
    }

    await book.save();

    // Respond with success message
    res.status(200).json({
      message: 'Book borrowed successfully.',
      collectDate: new Date(collectDate).toISOString().split('T')[0], // Format date as YYYY-MM-DD
      returnedDate: returnedDate ? new Date(returnedDate).toISOString().split('T')[0] : null,
      status: status || 'Notsubmit',
      isRead: isRead || 'NotRead',
    });
  } catch (error) {
    console.error('Error borrowing the book:', error.message);
    res.status(500).json({ status: 500, message: 'Error borrowing the book.', error: error.message });
  }
};
exports.borrowBook = async (req, res) => {
  try {
    const { admissionNo } = req.query; // Admission No from query params
    const { bookId } = req.params;     // Book ID from URL parameters
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    // Find the student profile based on admissionNo
    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    // Initialize borrowedBooks if it's missing
    if (!studentProfile.borrowedBooks) {
      studentProfile.borrowedBooks = [];
    }

    // Check if email matches between the token and the student profile
    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    // Retrieve the book by bookId from params
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(400).json({ message: 'Book not found.' });
    }

    // Check if the book is available for borrowing
    if (book.available <= 0 && req.body.status === 'Notsubmit') {
      return res.status(400).json({ message: 'Book not available for borrowing.' });
    }

    // Extract collectDate, returnedDate, status, and isRead from request body
    const { collectDate, returnedDate, status, isRead } = req.body;

    // Check if the student has already borrowed the same book on the same collectDate
    const existingBorrowedBook = await StudentBook.findOne({
      admissionNo: studentProfile.admissionNo,
      bookId: book._id,
      collectDate: new Date(collectDate).toISOString().split('T')[0], // Use only date (YYYY-MM-DD) part for comparison
    });

    if (existingBorrowedBook) {
      return res.status(400).json({ message: 'This book has already been borrowed by the student on this date.' });
    }

    // Create a new StudentBook entry with the admissionNo
    const studentBook = new StudentBook({
      bookId: book._id,
      admissionNo: studentProfile.admissionNo,  // Add admissionNo here
      collectDate: new Date(collectDate),
      returnedDate: returnedDate ? new Date(returnedDate) : null,
      status: status || 'Notsubmit',
      isRead: isRead || 'NotRead',
    });

    // Save the StudentBook entry
    await studentBook.save();

    // Adjust the book's availability based on the status
    if (status === 'submit') {
      book.available += 1; // Book is being returned, increase availability
    } else if (status === 'Notsubmit') {
      book.available -= 1; // Book is borrowed, decrease availability
    }

    await book.save();

    // Respond with success message
    res.status(200).json({
      message: 'Book borrowed successfully.',
      collectDate: new Date(collectDate).toISOString().split('T')[0], // Format date as YYYY-MM-DD
      returnedDate: returnedDate ? new Date(returnedDate).toISOString().split('T')[0] : null,
      status: status || 'Notsubmit',
      isRead: isRead || 'NotRead',
    });
  } catch (error) {
    console.error('Error borrowing the book:', error.message);
    res.status(500).json({ status: 500, message: 'Error borrowing the book.', error: error.message });
  }
};


exports.editBorrowedBook = async (req, res) => {
  try {
    const { admissionNo } = req.query; // Admission No from query params
    const { bookId } = req.params;     // Book ID from URL parameters
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(400).json({ status: 400, message: 'Token is required for authentication.' });
    }

    const rawToken = token.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(rawToken, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ status: 403, message: 'Token verification failed.' });
    }

    // Find the student profile based on admissionNo
    const studentProfile = await admissions.findOne({ admissionNo });
    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    // Check if email matches between the token and the student profile
    if (decoded.email !== studentProfile.email && !decoded.teacherAccess && !decoded.principalAccess) {
      return res.status(403).json({ status: 403, message: 'Email mismatch with admission number.' });
    }

    // Retrieve the book by bookId from params
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(400).json({ message: 'Book not found.' });
    }

    // Extract collectDate, returnedDate, status, and isRead from request body
    const { collectDate, returnedDate, status, isRead } = req.body;

    // Check if the new collectDate is being edited to the same day for the same book by the same student
    const existingBorrowedBook = await StudentBook.findOne({
      admissionNo: studentProfile.admissionNo,
      bookId: book._id,
      collectDate: new Date(collectDate).toISOString().split('T')[0], // Use only date part (YYYY-MM-DD)
    });

    if (existingBorrowedBook) {
      return res.status(400).json({ message: 'This book has already been borrowed by the student on this date.' });
    }

    // Find the studentBook record to edit based on admissionNo and bookId
    const studentBook = await StudentBook.findOne({
      admissionNo: studentProfile.admissionNo,
      bookId: book._id
    });

    if (!studentBook) {
      return res.status(404).json({ message: 'Borrowed book not found for this student.' });
    }

    // Update the borrowed book details
    studentBook.collectDate = new Date(collectDate);
    studentBook.returnedDate = returnedDate ? new Date(returnedDate) : null;
    studentBook.status = status || studentBook.status;
    studentBook.isRead = isRead || studentBook.isRead;

    // Save the updated StudentBook record
    await studentBook.save();

    // Adjust book availability based on status change
    if (status === 'submit' && studentBook.status !== 'submit') {
      book.available += 1;  // Book is being returned, increase availability
    } else if (status === 'Notsubmit' && studentBook.status === 'submit') {
      book.available -= 1;  // Book is being borrowed, decrease availability
    }

    await book.save();

    // Respond with the updated borrowed book details
    res.status(200).json({
      message: 'Borrowed book updated successfully.',
      collectDate: new Date(collectDate).toISOString().split('T')[0], // Format date as YYYY-MM-DD
      returnedDate: returnedDate ? new Date(returnedDate).toISOString().split('T')[0] : null,
      status: status || studentBook.status,
      isRead: isRead || studentBook.isRead,
    });
  } catch (error) {
    console.error('Error editing the borrowed book:', error.message);
    res.status(500).json({ status: 500, message: 'Error editing the borrowed book.', error: error.message });
  }
};
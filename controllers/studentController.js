
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const admissions = require('../models/Admission');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const ExamGradeModel = require('../models/ExamGrade');
const Attendance = require('../models/Attendance');

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








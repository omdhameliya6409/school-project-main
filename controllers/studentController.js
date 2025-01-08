const Student = require('../models/Student');
const admissions = require('../models/Admission');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const ExamGradeModel = require('../models/ExamGrade');  // Renaming to avoid conflict
const Attendance = require('../models/Attendance');
exports.getStudentProfile = async (req, res) => {
  try {
    const { admissionNo } = req.query; // Get admissionNo from query parameters

    if (!admissionNo) {
      return res.status(400).json({ status: 400, message: 'Admission number is required to fetch student profile.' });
    }

    // Fetch student profile
    const studentProfile = await admissions.findOne({ admissionNo });

    if (!studentProfile) {
      return res.status(404).json({ status: 404, message: 'Student profile not found.' });
    }

    // Fetch exam details based on student's class and section
    const examschedule = await Exam.findOne({
      class: studentProfile.class,
      section: studentProfile.section,
    });

    // Fetch ExamGrade details based on student's class and section
    const examGradeDetails = await ExamGradeModel.findOne({
      class: studentProfile.class,
      section: studentProfile.section,
    });
    const AttendanceDetails = await Attendance.findOne({
      class: studentProfile.class,
      section: studentProfile.section,
    });

    // Fetch fee details
    const feeDetails = await Fee.findOne({ admissionNo });

    // Prepare response data
    const responseData = {
      studentProfile,
      feeDetails: feeDetails || null, 
      examschedule: examschedule || null,
      examGrade: examGradeDetails || null, 
      Attendance: AttendanceDetails || null,
    };

    res.status(200).json({ status: 200, data: responseData });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching student profile, fee and exam details', error: error.message });
  }
};

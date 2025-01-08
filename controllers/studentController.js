const Student = require('../models/Student');
const admissions = require('../models/Admission');
// Get student profile by admissionNo
exports.getStudentProfileByAdmissionNo = async (req, res) => {
  try {
      const { admissionNo } = req.query; // Get admissionNo from query parameters

      if (!admissionNo) {
          return res.status(400).json({ status: 400, message: 'Admission number is required to fetch student profile.' });
      }

      const studentProfile = await admissions.findOne({ admissionNo });

      if (!studentProfile) {
          return res.status(404).json({ status: 404, message: 'Student profile not found.' });
      }

      res.status(200).json({ status: 200, data: studentProfile });
  } catch (error) {
      res.status(500).json({ status: 500, message: 'Error fetching student profile', error: error.message });
  }
};

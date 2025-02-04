const fs = require('fs');
const path = require('path');
const Admission = require('../models/Admission'); 


const getAdmissionCSV = async (req, res) => {
  try {
    const admissions = await Admission.find()
      .select(
        'admissionNo rollNo class section firstName lastName gender dateOfBirth category religion caste mobileNumber email admissionDate bloodGroup house height weight measurementDate medicalHistory'
      )
      .lean(); 
    if (admissions.length === 0) {
      return res.status(404).json({ message: 'No admissions found' });
    }
    const headers = [
      'admissionNo', 'rollNo', 'class', 'section', 'firstName', 'lastName', 'gender', 'dateOfBirth', 
      'category', 'religion', 'caste', 'mobileNumber', 'email', 'admissionDate', 'bloodGroup', 
      'house', 'height', 'weight', 'measurementDate', 'medicalHistory'
    ];
    const csvData = [
      headers.join(','),
      ...admissions.map(admission => 
        [
          admission.admissionNo, admission.rollNo, admission.class, admission.section, admission.firstName, 
          admission.lastName, admission.gender, admission.dateOfBirth.toISOString().split('T')[0], // Format Date to YYYY-MM-DD
          admission.category, admission.religion, admission.caste, admission.mobileNumber, admission.email, 
          admission.admissionDate.toISOString().split('T')[0], // Format Date to YYYY-MM-DD
          admission.bloodGroup, admission.house, admission.height, admission.weight, 
          admission.measurementDate ? admission.measurementDate.toISOString().split('T')[0] : '',
          admission.medicalHistory
        ].join(',')
      )
    ].join('\n'); 
    const uploadDir = path.join(__dirname, '../uploads');
    const csvFilePath = path.join(uploadDir, 'admissions.csv');

    fs.writeFile(csvFilePath, csvData, (err) => {
      if (err) {
        console.error('Error writing CSV file:', err);
        return res.status(500).json({ message: 'Error writing CSV file' });
      }
      res.download(csvFilePath, 'admissions.csv', (err) => {
        if (err) {
          console.error('Error sending the file:', err);
          res.status(500).json({ message: 'Error sending CSV file' });
        }
      });
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ message: 'Error fetching admission details' });
  }
};
const getDisabledStudentsList = async (req, res) => {
    try {
      const { studentClass, section, searchKeyword } = req.query;
      const filter = { isBlocked: true };
      if (studentClass) filter.class = studentClass;
      if (section) filter.section = section;
      if (searchKeyword) {
        const regex = new RegExp(searchKeyword, 'i');
        filter.$or = [
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
          { admissionNo: { $regex: regex } },
        ];
      }
      const disabledStudents = await Admission.find(filter);
      res.status(200).json({
        message: 'Disabled students fetched successfully',
        students: disabledStudents,
      });
    } catch (error) {
      console.error('Error fetching disabled students:', error);
      res.status(500).json({ message: 'Error fetching disabled students', error });
    }
  };

  const updateBlockStatus = async (req, res) => {
    const { id } = req.params;
    const { isBlocked } = req.body;
    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    try {
      const updatedStudent = await Admission.findByIdAndUpdate(
        id,
        { isBlocked },
        { new: true }
      );
      if (!updatedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json({
        message: `Student ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        student: updatedStudent,
      });
    } catch (error) {
      console.error('Error updating student status:', error);
      res.status(500).json({ message: 'Error updating student status', error });
    }
  };
  
module.exports = {
  getAdmissionCSV,
  getDisabledStudentsList,
  updateBlockStatus,
};

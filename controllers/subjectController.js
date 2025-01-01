// controllers/subjectController.js

const Subject = require('../models/Subject');

// Add a new subject
exports.addSubject = async (req, res) => {
    try {
      const { subject_name, type, subject_code } = req.body;
  
      // Validate input
      if (!subject_name || !type || !subject_code) {
        return res.status(400).json({
            status : 400,
          message: 'Bad Request',
          reason: 'Missing required fields (subject_name, type, subject_code)',
        });
      }
  
      // Check if the subject_code already exists
      const existingSubject = await Subject.findOne({ subject_code });
      if (existingSubject) {
        return res.status(400).json({
            status : 400,
          message: `Subject with code ${subject_code} already exists.`,
        });
      }
  
      // Create a new subject if it doesn't already exist
      const newSubject = new Subject({
        subject_name,
        type,
        subject_code,
      });
  
      await newSubject.save();
      res.status(200).json({
        status : 200,
        message: 'Subject created successfully',
        data: newSubject,
      });
    } catch (err) {
      console.error(err.message);
  
      if (err.name === 'ValidationError') {
        return res.status(400).json({
            status : 400,
          message: 'Validation error',
          reason: 'Invalid data format',
          errors: err.errors,
        });
      }
  
      res.status(500).json({
        status : 500,
        message: 'Server error',
        reason: 'Something went wrong on the server side.',
      });
    }
  };
// Edit an existing subject
exports.editSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, type, subject_code } = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { subject_name, type, subject_code },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({  status : 404,message: 'Subject not found' });
    }

    res.status(200).json(updatedSubject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({  status : 500, message: 'Server error' });
  }
};

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({  status : 500,message: 'Server error' });
  }
};

// Delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ status : 404 , message: 'Subject not found' });
    }

    await subject.remove();
    res.status(204).json();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status : 500 ,message: 'Server error' });
  }
};

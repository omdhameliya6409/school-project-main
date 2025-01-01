// controllers/subjectController.js

const mongoose = require('mongoose');

const Subject = require('../models/Subject');

exports.addSubject = async (req, res) => {
  try {
    const { subject_name, type, subject_code } = req.body;

    // Validate input
    if (!subject_name || !type || !subject_code) {
      return res.status(400).json({
        status: 400,
        message: 'Bad Request',
        reason: 'Missing required fields (subject_name, type, subject_code).',
      });
    }

    // Check if a subject with the same name already exists
    const existingSubject = await Subject.findOne({ subject_name });
    if (existingSubject) {
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the name "${subject_name}" already exists. Please choose a different name.`,
      });
    }

    // Create a new subject
    const newSubject = new Subject({
      subject_name,
      type,
      subject_code,
    });

    await newSubject.save();

    res.status(200).json({
      status: 200,
      message: 'Subject created successfully',
      data: newSubject,
    });
  } catch (err) {
    console.error(err.message);

    // Handle database duplicate key error
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the same ${duplicateField} already exists.`,
      });
    }

    // Generic server error
    res.status(500).json({
      status: 500,
      message: 'Server error',
      reason: 'Something went wrong while adding the subject.',
    });
  }
};




exports.editSubject = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request params
    const { subject_name, type, subject_code } = req.body;

    // Validate input
    if (!subject_name || !type || !subject_code) {
      return res.status(400).json({
        status: 400,
        message: 'Bad Request',
        reason: 'Missing required fields (subject_name, type, subject_code).',
      });
    }

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid subject ID',
      });
    }

    // Check if a subject with the same name already exists (excluding the current subject)
    const existingName = await Subject.findOne({
      subject_name,
      _id: { $ne: id }, // Exclude the current subject from the search
    });

    if (existingName) {
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the name "${subject_name}" already exists. Please choose a different name.`,
      });
    }

    // Check if a subject with the same code already exists (excluding the current subject)
    const existingCode = await Subject.findOne({
      subject_code,
      _id: { $ne: id }, // Exclude the current subject from the search
    });

    if (existingCode) {
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the code "${subject_code}" already exists. Please choose a different code.`,
      });
    }

    // Perform the update
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { subject_name, type, subject_code },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    // If the subject is not found
    if (!updatedSubject) {
      return res.status(404).json({
        status: 404,
        message: 'Subject not found',
      });
    }

    // Success response
    res.status(200).json({
      status: 200,
      message: 'Subject updated successfully',
      data: updatedSubject,
    });
  } catch (err) {
    console.error(err.message);

    // Handle database duplicate key error
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        status: 409,
        message: `A subject with the same ${duplicateField} already exists.`,
      });
    }

    // Generic server error
    res.status(500).json({
      status: 500,
      message: 'Server error',
      reason: 'Something went wrong while updating the subject.',
    });
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

// Delete a subject by ID
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    // Find and delete the subject by ID
    const subject = await Subject.findByIdAndDelete(id);

    // If the subject is not found
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Successfully deleted the subject, return status 200 with a message
    res.status(200).json({
      message: 'Subject deleted successfully',
      data: subject, // Optionally, you can return the deleted subject as part of the response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: 'Server error',
      reason: 'Something went wrong while deleting the subject.',
    });
  }
};

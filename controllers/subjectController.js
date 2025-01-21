const mongoose = require('mongoose');
const Subject = require('../models/Subject');


exports.addSubject = async (req, res) => {
  try {
    const { subject_name, type, subject_code } = req.body;

   
    if (!subject_name || !type || !subject_code) {
      return res.status(400).json({
        status: 400,
        message: 'Bad Request',
        reason: 'Missing required fields (subject_name, type, subject_code).',
      });
    }

 
    const existingSubject = await Subject.findOne({ subject_name });
    if (existingSubject) {
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the name "${subject_name}" already exists. Please choose a different name.`,
      });
    }


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

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the same ${duplicateField} already exists.`,
      });
    }


    res.status(500).json({
      status: 500,
      message: 'Server error',
      reason: 'Something went wrong while adding the subject.',
    });
  }
};

exports.editSubject = async (req, res) => {
  try {
    const { id } = req.params; 
    const { subject_name, type, subject_code } = req.body;


    if (!subject_name || !type || !subject_code) {
      return res.status(400).json({
        status: 400,
        message: 'Bad Request',
        reason: 'Missing required fields (subject_name, type, subject_code).',
      });
    }


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid subject ID',
      });
    }

    const existingName = await Subject.findOne({
      subject_name,
      _id: { $ne: id }, 
    });

    if (existingName) {
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the name "${subject_name}" already exists. Please choose a different name.`,
      });
    }


    const existingCode = await Subject.findOne({
      subject_code,
      _id: { $ne: id }, 
    });

    if (existingCode) {
      return res.status(409).json({
        status: 409,
        message: 'Conflict',
        reason: `A subject with the code "${subject_code}" already exists. Please choose a different code.`,
      });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { subject_name, type, subject_code },
      { new: true, runValidators: true } 
    );


    if (!updatedSubject) {
      return res.status(404).json({
        status: 404,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Subject updated successfully',
      data: updatedSubject,
    });
  } catch (err) {
    console.error(err.message);

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        status: 409,
        message: `A subject with the same ${duplicateField} already exists.`,
      });
    }


    res.status(500).json({
      status: 500,
      message: 'Server error',
      reason: 'Something went wrong while updating the subject.',
    });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({  status : 500,message: 'Server error' });
  }
};


exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status : 400,message: 'Invalid subject ID' });
    }

 
    const subject = await Subject.findByIdAndDelete(id);


    if (!subject) {
      return res.status(404).json({ status : 404 ,message: 'Subject not found' });
    }

    
    res.status(200).json({
      status : 200,
      message: 'Subject deleted successfully',
      data: subject, 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status : 500,
      message: 'Server error',
      reason: 'Something went wrong while deleting the subject.',
    });
  }
};

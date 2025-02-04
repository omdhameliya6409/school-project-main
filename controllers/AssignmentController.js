const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');


const createAssignment = async (req, res) => {
  try {
    const { 
      class: cls, 
      section, 
      Assignmentnote, 
      subject, 
      AssignmentDate, 
      submissionDate 
    } = req.body;

    const teacherId = "T123456"; 
    const teacherName = "John Doe";

    const newAssignment = new Assignment({
      class: cls,
      section,
      Assignmentnote,
      subject,
      AssignmentDate,
      submissionDate,
      createdBy: teacherId, 
    });

    await newAssignment.save();

    res.status(200).json({
      status: 200,
      message: 'Assignment created successfully',
      data: {
        ...newAssignment._doc, 
        teacherId,            
        teacherName,           
      },
    });
  } catch (err) {
    if (err.code === 11000) { 
      res.status(400).json({
        status: 400,
        error: `Duplicate Assignment entry: Assignment for subject '${req.body.subject}' on date '${req.body.AssignmentDate}' already exists.`,
      });
    } else {
      res.status(500).json({ status: 500, error: err.message });
    }
  }
};
const getAssignmentByFilters = async (req, res) => {
  try {
    const { cls, Section, Subject } = req.query;
    if (!cls || !Section || !Subject) {
      return res.status(400).json({ status: 400, error: 'Class, Section, and Subject are required fields' });
    }
    const filter = {
      class: cls,
      section: Section,
      subject: { $regex: Subject, $options: 'i' },
    };
    const assignments = await Assignment.find(filter);
    if (assignments.length === 0) {
      return res.status(404).json({ status: 404, message: 'No Assignment found for the given filters' });
    }

    const teacherId = "T123456"; 
    const teacherName = "John Doe"; 

    const enrichedAssignments = assignments.map((assignment) => ({
      ...assignment._doc, 
      teacherId,         
      teacherName,        
    }));

    res.status(200).json({
      status: 200,
      message: 'Request successful',
      data: enrichedAssignments,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: cls, section, Assignmentnote , subject, AssignmentDate, submissionDate } = req.body;

    const duplicateAssignment = await Assignment.findOne({
      _id: { $ne: id },
      AssignmentDate,
      subject,
    });

    if (duplicateAssignment) {
      return res.status(400).json({
        status: 400,
        error: `Duplicate Assignment entry: Assignment for subject '${subject}' on date '${AssignmentDate}' already exists.`,
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      {
        class: cls,
        section,
        subject,
        Assignmentnote,
        AssignmentDate,
        submissionDate,

      },
      { new: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ status: 404, error: 'Assignment not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Assignment updated successfully',
      data: updatedAssignment,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;  

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 400, error: 'Invalid Assignment ID format' });
    }
    const deletedAssignment = await Assignment.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return res.status(404).json({ status: 404, error: 'Assignment not found' });
    }
    res.status(200).json({
      status: 200,
      message: 'Assignment deleted successfully',
      data: deletedAssignment,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

module.exports = {
  createAssignment,
  getAssignmentByFilters,
  updateAssignment,
  deleteAssignment,
};

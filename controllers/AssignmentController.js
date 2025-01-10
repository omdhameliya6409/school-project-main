const Assignment = require('../models/Assignment');


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

    // Dummy teacher information for response
    const teacherId = "T123456"; // Replace with dynamic value if needed
    const teacherName = "John Doe"; // Replace with dynamic value if needed

    const newAssignment = new Assignment({
      class: cls,
      section,
      Assignmentnote,
      subject,
      AssignmentDate,
      submissionDate,
      createdBy: teacherId,  // Save the teacher's ID in the document
    });

    await newAssignment.save();

    res.status(200).json({
      status: 200,
      message: 'Assignment created successfully',
      data: {
        ...newAssignment._doc, // Spread existing assignment details
        teacherId,             // Add teacher ID to response
        teacherName,           // Add teacher Name to response
      },
    });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
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
    const { class: cls, section, subject } = req.query;

    if (!cls || !section || !subject) {
      return res.status(400).json({ status: 400, error: 'Class, Section, and Subject are required fields' });
    }

    const filter = {
      class: cls,
      section,
      subject: { $regex: subject, $options: 'i' },
    };

    const Assignment = await Assignment.find(filter);

    if (Assignment.length === 0) {
      return res.status(404).json({ status: 404, message: 'No Assignment found for the given filters' });
    }

    res.status(200).json({
      status: 200,
      message: 'Request successful',
      data: Assignment,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};


const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: cls, section, subjectGroup, subject, AssignmentDate, submissionDate, evaluationDate, createdBy } = req.body;

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
        subjectGroup,
        subject,
        AssignmentDate,
        submissionDate,
        evaluationDate,
        createdBy,
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
    const AssignmentId = req.params.id;

    const Assignment = await Assignment.findByIdAndDelete(AssignmentId);

    if (!Assignment) {
      return res.status(404).json({ status: 404, error: 'Assignment not found' });
    }

    res.status(200).json({ status: 200, message: 'Assignment deleted successfully' });
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

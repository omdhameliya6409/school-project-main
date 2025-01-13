const mongoose = require('mongoose');

const AssignmentScheduleSchema = new mongoose.Schema({
  class: { 
    type: String, 
    required: true, 
    enum: ['9', '10', '11', '12'],
    message: 'Class must be one of 9, 10, 11, or 12' 
  },
  section: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D'], 
    required: true 
  },
  assignmentNote: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  assignmentDate: { 
    type: Date, 
    required: true 
  },
  submissionDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        return value > this.assignmentDate;
      },
      message: 'Submission date must be after the assignment date',
    }
  },
  assignedTeacher: { // Added reference to the teacher (User model)
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', // Assuming 'User' is the teacher's model// This can be optional depending on your use case
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // Reference to students collection
  students: [{
    rollNo: { type: Number, required: true },
    name: { type: String, required: true },
    status: { type: String, default: 'pending' },
    marks: { type: Number, default: 0 }
  }],// Store references to Student ObjectIds here
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSchedule', AssignmentScheduleSchema);

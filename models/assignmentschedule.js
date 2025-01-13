const mongoose = require('mongoose');

const AssignmentScheduleSchema = new mongoose.Schema({
  class: { 
    type: String, 
    required: true, 
    enum: ['9', '10', '11', '12'], // Restrict class to specific values
    message: 'Class must be one of 9, 10, 11, or 12' 
  },
  section: { 
    type: String, 
    required: true, 
    enum: ['A', 'B', 'C', 'D'], // Restrict section to specific values
    message: 'Section must be one of A, B, C, or D'
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
  assignedTeacher: { // Reference to the teacher
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', // Assuming 'Teacher' is the teacher's model
  },
  students: [{
    rollNo: { 
      type: Number, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'complete', 'rejected'], // Restrict status to specific values
      default: 'pending' 
    },
    marks: { 
      type: Number, 
      default: 0 
    },
    gradeNo: { 
      type: String, 
      enum: ['A', 'B', 'C', 'D', 'F'], // Restrict grade to specific values
      required: function() {
        return this.status === 'complete';
      }
    },
    reason: { 
      type: String, 
      required: function() {
        return this.status === 'rejected'; // Reason is required only for rejected status
      }
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSchedule', AssignmentScheduleSchema);

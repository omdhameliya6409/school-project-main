const mongoose = require('mongoose');

const AssignmentScheduleSchema = new mongoose.Schema({
  class: { 
    type: String, 
    required: true, 
    enum: ['9', '10', '11', '12'],
  },
  section: { 
    type: String, 
    required: true, 
    enum: ['A', 'B', 'C', 'D'],
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
  assignedTeacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher',
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
      enum: ['pending', 'complete', 'rejected'], 
      default: 'pending' 
    },
    marks: { 
      type: Number, 
      default: 0 
    },
    gradeNo: { 
      type: String, 
      enum: ['A', 'B', 'C', 'D', 'F'],
      required: function() {
        return this.status === 'complete' && this.submission === 'accept';
      }
    },
    reason: { 
      type: String, 
      required: function() {
        return this.status === 'rejected';
      }
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSchedule', AssignmentScheduleSchema);
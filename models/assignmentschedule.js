const mongoose = require('mongoose');

const assignmentschema = new mongoose.Schema({
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        required: true
    },
    subjectname: {
        type: String,
        required: true
    },
    assignmentname: {
        type: String,
        required: true
    },
    submissiondate: {
        type: Date,
        required: true
    },
},
    {
        timestamps: true,
    }
);

// Create a unique index for `class`, `section`, and `Date`
assignmentschema.index({ class: 1, section: 1, Date: 1 }, { unique: true });
module.exports = mongoose.model('AssignmentSchedule', assignmentschema);
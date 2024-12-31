const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    admissionNo: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    applyDate: {
        type: Date,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        required: true
    },
    reason: {
        type: String,
        required: true
    }
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;

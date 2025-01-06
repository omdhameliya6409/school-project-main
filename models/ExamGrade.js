const mongoose = require('mongoose');

const examGradeSchema = new mongoose.Schema({
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
    exam: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    passorfail: {
        type: String,
        required: true
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
})

module.exports = mongoose.model('ExamGrade', examGradeSchema);
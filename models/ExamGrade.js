const mongoose = require('mongoose');

const examGradeSchema = new mongoose.Schema({
    examtype: {
        type: String,
        required: true,
    },
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
    date: { 
        type: Date, 
        required: [true, 'Date is required'] 
      },
}, {
    timestamps: true, 
})

module.exports = mongoose.model('ExamGrade', examGradeSchema);
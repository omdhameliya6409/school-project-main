const mongoose = require("mongoose");

const subjectmarksreportSchema = new mongoose.Schema({
    examtype: {
        type: String,
        required: true,
    },
    admissionNo: { 
        type: Number, 
        required: true, 
    },
    name: { 
        type: String, 
        required: true 
    },
    rollNo: { 
        type: Number, 
        required: true 
    },
    class: { 
        type: Number, 
        required: true 
    },
    section: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String, 
        required: true 
    },
    totalmarks: { 
        type: Number, 
        required: true 
    },
    marksobtained: { 
        type: Number, 
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
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model("SubjectMarksReport", subjectmarksreportSchema);

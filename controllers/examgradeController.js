const ExamGrade = require('../models/ExamGrade');

exports.createExamGrade = async (req, res) => {
    try {
        const { admissionNo, name, class: studentClass, section, subject, grade, passorfail ,date ,examtype} = req.body;
        if (!admissionNo || !name || !studentClass || !section || !subject || !grade || !passorfail || !date || !examtype) {
            return res.status(400).json({ status : 400 ,message: 'All fields are required' });
        }
        const newExamGrade = new ExamGrade({
            admissionNo,
            name,
            class: studentClass,
            section,
            subject,
            grade,
            passorfail,
            date,
            examtype,
        });
        const savedExamGrade = await newExamGrade.save();
        res.status(200).json({ status : 200 , message: 'Exam grade created successfully', data: savedExamGrade });
    } catch (error) {
        res.status(500).json({ status : 500 ,message: 'Error creating exam grade', error: error.message });
    }
};

exports.updateExamGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { admissionNo, name, class: studentClass, section, subject, grade, passorfail, date , examtype} = req.body;
        if (!admissionNo || !name || !studentClass || !section || !subject || !grade || !passorfail || !date || !examtype) {
            return res.status(400).json({status : 400 , message: 'All fields are required' });
        }
        const updatedExamGrade = await ExamGrade.findByIdAndUpdate(
            id,
            { admissionNo, name, class: studentClass, section, subject, grade, passorfail, date ,examtype},
            { new: true, runValidators: true }
        );
        if (!updatedExamGrade) {
            return res.status(404).json({ status : 404 , message: 'Exam grade not found' });
        }
        res.status(200).json({ status : 200 , message: 'Exam grade updated successfully', data: updatedExamGrade });
    } catch (error) {
        res.status(500).json({status : 500 ,  message: 'Error updating exam grade', error: error.message });
    }
};

exports.deleteExamGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExamGrade = await ExamGrade.findByIdAndDelete(id);

        if (!deletedExamGrade) {
            return res.status(404).json({ message: 'Exam grade not found' });
        }

        res.status(200).json({ status : 200 , message: 'Exam grade deleted successfully' });
    } catch (error) {
        res.status(500).json({ status : 500 , message: 'Error deleting exam grade', error: error.message });
    }
};

exports.getAllExamGrades = async (req, res) => {
    try {
        const { class: className, section, examtype, grade } = req.query;

        if (!className || !section || !examtype || !grade) {
            return res.status(400).json({
                status: 400,
                message: 'Missing required query parameters: class, section, examtype, and grade are required.'
            });
        }
        
        const filter = {
            class: className,
            section: section,
            examtype: examtype,
            grade: grade
        };

        const examGrades = await ExamGrade.find(filter);
        res.status(200).json({ status: 200, data: examGrades });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error fetching exam grades', error: error.message });
    }
};

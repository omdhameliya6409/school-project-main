const Exam = require('../models/Exam');  // Correct if file name is 'Exam.js'
// Create Exam
exports.createExam = async (req, res) => {
  try {
    const { examType, class: className, section, subject, date, startTime, duration, day } = req.body;

    // Check for duplicate exams by examType, date, and startTime
    const duplicateExam = await Exam.findOne({ examType, date, startTime });
    if (duplicateExam) {
      return res.status(400).json({
        status: 400,
        message: 'Duplicate exam entry detected for the given type, date, and start time.',
      });
    }

    const exam = new Exam({ examType, class: className, section, subject, date, startTime, duration, day });
    const savedExam = await exam.save();

    res.status(201).json({
      status: 201,
      message: 'Exam created successfully',
      exam: savedExam,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};



// Get exams with filters
exports.getExamsByFilter = async (req, res) => {
  try {
    const { examType, class: className, section } = req.query;

    if (!examType || !className || !section) {
      return res.status(400).json({
        status: 400,
        message: 'examType, class, and section are required',
      });
    }

    const filter = { examType, class: className, section };
    const exams = await Exam.find(filter);

    if (exams.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No exams found with the given filters',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Exams retrieved successfully',
      exams,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};


// Edit Exam
exports.editExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { examType, date, startTime, subject, duration, day } = req.body;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        status: 404,
        message: 'Exam not found',
      });
    }

    const duplicateExam = await Exam.findOne({
      _id: { $ne: id },
      examType,
      date,
      startTime,
    });
    if (duplicateExam) {
      return res.status(400).json({
        status: 400,
        message: 'Duplicate exam entry detected for the given type, date, and start time.',
      });
    }

    exam.examType = examType || exam.examType;
    exam.date = date || exam.date;
    exam.startTime = startTime || exam.startTime;
    exam.subject = subject || exam.subject;
    exam.duration = duration || exam.duration;
    exam.day = day || exam.day;

    const updatedExam = await exam.save();
    res.status(200).json({
      status: 200,
      message: 'Exam updated successfully',
      exam: updatedExam,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

// Delete Exam
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        status: 404,
        message: 'Exam not found',
      });
    }

    await Exam.findByIdAndDelete(id);

    res.status(200).json({
      status: 200,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};


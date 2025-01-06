const Exam = require('../models/Exam');  // Correct if file name is 'Exam.js'

// Create Exam
exports.createExam = async (req, res) => {
  try {
    const { examName, dateFrom, startTime, roomNumber } = req.body;

    // Check for duplicate exams by dateFrom and roomNumber
    const duplicateExamByDate = await Exam.findOne({ dateFrom, roomNumber });
    if (duplicateExamByDate) {
      return res.status(400).json({
        status: 400,
        message: 'Duplicate exam entry detected for the given date and room.',
        duplicateField: 'dateFrom',
      });
    }

    // Check for duplicate exams by examName, dateFrom, and startTime
    const duplicateExam = await Exam.findOne({ examName, dateFrom, startTime, roomNumber });
    if (duplicateExam) {
      return res.status(400).json({
        status: 400,
        message: 'Duplicate exam entry detected. Please change the provided details.',
        duplicateFields: { examName, dateFrom, startTime, roomNumber },
      });
    }

    const exam = new Exam(req.body);
    const savedExam = await exam.save();
    res.status(200).json({
      status: 200,
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

// Get all exams
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find();

    if (exams.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No exams found',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Exams retrieved successfully',
      exams: exams,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

// Get exams with filters
exports.getExamsbyfilter = async (req, res) => {
  try {
    const { examGroup, examName } = req.query;

    if (!examGroup || !examName) {
      return res.status(400).json({
        status: 400,
        message: 'Both examGroup and examName are required',
      });
    }

    const filter = { examGroup, examName };
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
      exams: exams,
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
    const { examName, dateFrom, startTime, roomNumber } = req.body;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        status: 404,
        message: 'Exam not found',
      });
    }

    const duplicateExam = await Exam.findOne({
      _id: { $ne: id },
      examName,
      dateFrom,
      startTime,
      roomNumber,
    });
    if (duplicateExam) {
      return res.status(400).json({
        status: 400,
        message: 'Duplicate exam entry detected. Please change the provided details.',
        duplicateFields: { examName, dateFrom, startTime, roomNumber },
      });
    }

    exam.examName = examName || exam.examName;
    exam.dateFrom = dateFrom || exam.dateFrom;
    exam.startTime = startTime || exam.startTime;
    exam.roomNumber = roomNumber || exam.roomNumber;

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

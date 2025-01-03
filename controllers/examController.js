const Exam = require('../models/exam');

exports.createExam = async (req, res) => {
  try {
    const { examName, dateFrom, startTime, roomNumber } = req.body;

    // Check for duplicate exams by dateFrom
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
// Get exams with required filtering by examGroup and examName
exports.getExams = async (req, res) => {
    try {
      const { examGroup, examName } = req.query; // Retrieve query parameters

      // Check if both examGroup and examName are provided
      if (!examGroup || !examName) {
        return res.status(400).json({
          status: 400,
          message: 'Both examGroup and examName are required',
        });
      }

      // Build the filter object for querying (exact match)
      const filter = {
        examGroup: examGroup,  // Filter exams by the provided examGroup (exact match)
        examName: examName,    // Filter exams by the provided examName (exact match)
      };

      // Fetch exams based on the filter
      const exams = await Exam.find(filter);

      // If no exams found, return a message
      if (exams.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'No exams found with the given filters',
        });
      }

      // Return the list of exams matching the filter
      res.status(200).json({
        status: 200,
        message: 'Exams retrieved successfully',
        exams: exams,
      });
    } catch (error) {
      // Handle any errors that occur
      res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
      });
    }
};

  
  

exports.editExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { examName, dateFrom, startTime, roomNumber } = req.body;

    // Check if the exam to update exists
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        status: 404,
        message: 'Exam not found',
      });
    }

    // Check for duplicates by dateFrom and roomNumber
    const duplicateExamByDate = await Exam.findOne({
      _id: { $ne: id }, // Exclude the current exam
      dateFrom,
      roomNumber,
    });
    if (duplicateExamByDate) {
      return res.status(400).json({
        status: 400,
        message: 'Duplicate exam entry detected for the given date and room.',
        duplicateField: 'dateFrom',
      });
    }

    // Check for duplicates by examName, dateFrom, and startTime
    const duplicateExam = await Exam.findOne({
      _id: { $ne: id }, // Exclude the current exam
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

    // Update the exam with new data
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

// Delete an exam by ID
exports.deleteExam = async (req, res) => {
    try {
      // Retrieve the exam ID from the request parameters
      const { id } = req.params;
  
      // Check if the exam exists
      const exam = await Exam.findById(id);
      if (!exam) {
        // If the exam doesn't exist, return 404 with a message
        return res.status(404).json({
          status: 404,
          message: 'Exam not found',
        });
      }
  
      // Delete the exam
      await Exam.findByIdAndDelete(id);
  
      // Respond with success message
      res.status(200).json({
        status: 200,
        message: 'Exam deleted successfully',
      });
    } catch (error) {
      // Handle errors such as database issues
      res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
      });
    }
  };
  

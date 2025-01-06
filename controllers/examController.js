const Exam = require('../models/Exam'); // Assuming Exam model is in models/Exam.js
exports.createExam = async (req, res) => {
  try {
    const { examName, dateFrom, startTime, roomNumber, day } = req.body;

    // Calculate the day based on dateFrom, but only if no day is provided in the request
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCalculated = new Date(dateFrom).getDay();
    const dayOfWeek = dayNames[dayCalculated];

    const dayToUse = day || dayOfWeek; // Use the provided day or the calculated day

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

    // Create the exam and save it to the database
    const exam = new Exam({
      ...req.body,
      day: dayToUse, // Set the day from the user input or calculated value
    });

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
exports.getExamsbyfilter = async (req, res) => {
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
      examGroup: examGroup,
      examName: examName,
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
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
exports.getExams = async (req, res) => {
  try {
    // Fetch all exams from the database
    const exams = await Exam.find(); // No filter applied, fetching all exams

    // If no exams found, return a message
    if (exams.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No exams found',
      });
    }
    // Return the list of all exams
    const examDetails = exams.map(exam => ({
      examGroup: exam.examGroup,
      examName: exam.examName,
      subject: exam.subject,
      dateFrom: exam.dateFrom,
      startTime: exam.startTime,  // Including startTime in the response
      duration: exam.duration,
      roomNumber: exam.roomNumber,
      marksMax: exam.marksMax,
      marksMin: exam.marksMin,
      day: exam.day,
    }));

    res.status(200).json({
      status: 200,
      message: 'Exams retrieved successfully',
      exams: examDetails,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

// Update an exam by ID
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
      _id: { $ne: id },
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

    // Calculate the day based on dateFrom
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = new Date(dateFrom).getDay();
    const day = dayNames[dayIndex];

    // Update the exam with new data
    exam.examName = examName || exam.examName;
    exam.dateFrom = dateFrom || exam.dateFrom;
    exam.startTime = startTime || exam.startTime;
    exam.roomNumber = roomNumber || exam.roomNumber;
    exam.day = day; // Update the day field

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
    const { id } = req.params;

    // Check if the exam exists
    const exam = await Exam.findById(id);
    if (!exam) {
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
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

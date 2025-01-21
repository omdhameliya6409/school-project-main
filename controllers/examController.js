const mongoose = require('mongoose');
const Exam = require('../models/Exam');  



function calculateDuration(startTime, endTime) {

  function convertTo24HourFormat(time) {
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(num => parseInt(num));

    if (period === "PM" && hours !== 12) {
      hours += 12; 
    }
    if (period === "AM" && hours === 12) {
      hours = 0; 
    }

    return new Date(2025, 0, 1, hours, minutes); 
  }

  const start = convertTo24HourFormat(startTime);
  const end = convertTo24HourFormat(endTime);

  const durationInMs = end - start; 
  const durationInMinutes = Math.floor(durationInMs / 60000); 

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}


exports.createExam = async (req, res) => {
  try {
    const { examType, class: examClass, section, subject, date, startTime, duration, day } = req.body;

    const existingExam = await Exam.findOne({
      examType: examType,
      date: date,
      startTime: startTime,
      subject: subject,
    });

    if (existingExam) {
      return res.status(400).json({
        status: 400,
        message: `An exam for ${subject} is already scheduled on ${date} at ${startTime}. Please choose a different time.`,
      });
    }


    const newExam = new Exam({
      examType: examType,
      class: examClass,
      section: section,
      subject: subject,
      date: date,
      startTime: startTime,
      duration: duration,
      day: day,
    });

    await newExam.save();

    return res.status(201).json({
      status: 201,
      message: 'Exam created successfully',
      exam: newExam,
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

exports.editExam = async (req, res) => {
  try {
    const { id } = req.params;  
    console.log('Received examId:', id);


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid examId format',
      });
    }

  
    const existingExam = await Exam.findById(id);
    console.log('Exam found:', existingExam);  

  
    if (!existingExam) {
      return res.status(404).json({
        status: 404,
        message: 'Exam not found',
      });
    }

    const { examType, class: examClass, section, subject, date, startTime, duration, day } = req.body;

    existingExam.examType = examType || existingExam.examType;
    existingExam.class = examClass || existingExam.class;
    existingExam.section = section || existingExam.section;
    existingExam.subject = subject || existingExam.subject;
    existingExam.date = date || existingExam.date;
    existingExam.startTime = startTime || existingExam.startTime;
    existingExam.duration = duration || existingExam.duration;
    existingExam.day = day || existingExam.day;


    await existingExam.save();

    return res.status(200).json({
      status: 200,
      message: 'Exam updated successfully',
      exam: existingExam,
    });
  } catch (err) {
    console.error('Error:', err);  
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

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


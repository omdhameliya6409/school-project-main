const Teacher = require('../models/Teacher');
const Schedule = require('../models/schedule');

// Function to format the class assignment
const formatClassAssignment = (schedule) => {
  return schedule.map((item) => ({
    Subject: item.subject,  // Only subject name without teacher ID
    Time: item.time,
    Teacher: item.teacherName,  // Teacher name only
    RoomNo: `Room ${item.room}`,  // Room number formatted as 'Room X'
  }));
};

const getFormattedSchedule = async (req, res) => {
  const { className, section } = req.query;

  if (!className || !section) {
    return res.status(400).json({ error: 'Both class and section are required as query parameters' });
  }

  try {
    // Fetch schedules matching the class and section
    const schedules = await Schedule.find({ 
      class: className, 
      section: section 
    });

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ error: 'No schedules found for the specified class and section' });
    }

    // Format the response
    const formattedSchedules = schedules.map(schedule => ({
      Class: schedule.class,
      Section: schedule.section,
      Subject: schedule.subject,
      Time: schedule.time,
      Teacher: schedule.teacherName,
      RoomNo: `Room ${schedule.room}`
    }));

    return res.json(formattedSchedules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


// Controller function to add a new schedule (POST)
const addSchedule = async (req, res) => {
  const { teacherId, subject, time, teacherName, room, className, section } = req.body;

  // Validate room number (1-20)
  if (room < 1 || room > 20) {
    return res.status(400).json({ error: 'Room number must be between 1 and 20' });
  }

  // Validate class (9, 10, 11, 12)
  const validClasses = [9, 10, 11, 12];
  if (!validClasses.includes(className)) {
    return res.status(400).json({ error: `Class must be one of the following: ${validClasses.join(', ')}` });
  }

  // Validate section (A, B, C, D)
  const validSections = ['A', 'B', 'C', 'D'];
  if (!validSections.includes(section)) {
    return res.status(400).json({ error: `Section must be one of the following: ${validSections.join(', ')}` });
  }

  try {
    // Check if the teacher exists
    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Create a new schedule entry
    const newSchedule = new Schedule({
      teacherId,
      subject,
      time,
      teacherName,
      room,
      class: className,
      section,
    });

    // Save the new schedule to the database
    await newSchedule.save();

    return res.status(201).json({
      message: 'Schedule added successfully',
      schedule: newSchedule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};



module.exports = { getFormattedSchedule, addSchedule };

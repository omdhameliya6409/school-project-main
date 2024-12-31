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

// Controller function to get formatted schedule (GET)
const getFormattedSchedule = async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);

  try {
    // Fetch teacher details from the Teacher model
    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Fetch the schedule for this teacher from the Schedule model
    const schedule = await Schedule.find({ teacherId });

    if (!schedule || schedule.length === 0) {
      return res.status(404).json({ error: 'No schedule found for this teacher' });
    }

    // Format and return the schedule
    const formattedSchedule = formatClassAssignment(schedule);
    return res.json(formattedSchedule);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Controller function to add a new schedule (POST)
const addSchedule = async (req, res) => {
  const { teacherId, subject, time, teacherName, room } = req.body;

  // Validate room number (1-20)
  if (room < 1 || room > 20) {
    return res.status(400).json({ error: 'Room number must be between 1 and 20' });
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
    });

    // Save the new schedule to the database
    await newSchedule.save();

    return res.status(201).json({ message: 'Schedule added successfully', schedule: newSchedule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getFormattedSchedule, addSchedule };

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
  const { teacherName } = req.query;  // Extract teacherName from query parameters

  if (!teacherName) {
    return res.status(400).json({ status : 400 ,error: 'Teacher name is required as a query parameter' });
  }

  try {
    // Fetch schedules matching the teacher's name
    const schedules = await Schedule.find({ teacherName: teacherName });

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({status : 404 , error: 'No schedules found for the specified teacher' });
    }

    // Format the response
    const formattedSchedules = schedules.map(schedule => ({
      Class: schedule.className,  // Assuming className is the field name
      Section: schedule.section,
      Subject: schedule.subject,
      Time: schedule.time,
      Teacher: schedule.teacherName,
      RoomNo: `Room ${schedule.room}`,
      Day: schedule.day  // Include the day in the response
    }));

    return res.json(formattedSchedules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status : 500 ,error: error.message });
  }
};




// Function to add a new schedule (POST)
const addSchedule = async (req, res) => {
  const { teacherId, subject, time, teacherName, room, className, section, day } = req.body;

  // Validate room number (1-20)
  if (room < 1 || room > 20) {
    return res.status(400).json({ status : 400 ,error: 'Room number must be between 1 and 20' });
  }

  // Validate day
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!validDays.includes(day)) {
    return res.status(400).json({  status : 400 ,error: `Day must be one of: ${validDays.join(', ')}` });
  }

  try {
    // Check if the teacher exists
    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({  status : 404 ,error: 'Teacher not found' });
    }

    // Create a new schedule entry
    const newSchedule = new Schedule({
      teacherId,
      subject,
      time,
      teacherName,
      room,
      className,  // Use correct field name
      section,
      day,
    });

    // Save the new schedule to the database
    await newSchedule.save();

    return res.status(200).json({ status : 200 ,message: 'Schedule added successfully', schedule: newSchedule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({  status : 500 ,error: error.message });
  }
};

module.exports = { getFormattedSchedule, addSchedule };


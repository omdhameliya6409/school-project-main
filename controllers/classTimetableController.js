const ClassTimetable = require('../models/classTimetable');

// Function to add a new class timetable entry
const addClassTimetable = async (req, res) => {
  const { class: className, subject, teacherName, time, room, day, section } = req.body;

  try {
    // Create a new timetable entry
    const newTimetable = new ClassTimetable({
      class: className,
      subject,
      teacherName,
      time,
      room,
      day,
      section,
    });

    // Save the new timetable entry
    await newTimetable.save();
    return res.status(201).json({
      message: 'Class timetable added successfully',
      timetable: newTimetable,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Function to get the class timetable for a specific class and section
const getClassTimetable = async (req, res) => {
  const { className, section } = req.query; // Extract class and section from query parameters

  // Validate query parameters
  if (!className || !section) {
    return res.status(400).json({ error: 'Both className and section are required as query parameters.' });
  }

  try {
    // Find the timetable entries for the specified class and section
    const timetable = await ClassTimetable.find(
      { class: className, section: section },
      'subject teacherName time room day' // Only select these fields
    );

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ error: 'No timetable found for the specified class and section.' });
    }

    return res.status(200).json(timetable); // Return the filtered timetable data
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};


module.exports = { addClassTimetable, getClassTimetable };
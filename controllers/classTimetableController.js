const ClassTimetable = require('../models/classTimetable');

const addClassTimetable = async (req, res) => {
  const { class: className, subject, teacherName, time, room, day, section } = req.body;

  try {

    const newTimetable = new ClassTimetable({
      class: className,
      subject,
      teacherName,
      time,
      room,
      day,
      section,
    });

    await newTimetable.save();
    return res.status(200).json({
      status : 200,
      message: 'Class timetable added successfully',
      timetable: newTimetable,
    });
  } catch (message) {
    console.message(message);
    return res.status(500).json({ status:500 ,cmessage: message.message });
  }
};


const getClassTimetable = async (req, res) => {
  const { className, section } = req.query;


  if (!className || !section) {
    return res.status(400).json({ status:400 ,message: 'Both className and section are required as query parameters.' });
  }

  try {
   
    const timetable = await ClassTimetable.find(
      { class: className, section: section },
      'subject teacherName time room day' 
    );

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ status:404 , message: 'No timetable found for the specified class and section.' });
    }
    return res.status(200).json({ status:200 , message: 'Success', timetable: timetable });
  } catch (message) {
    console.message('message fetching timetable:', message);
    return res.status(500).json({ status:500 , message: 'Internal server message.' });
  }
};


module.exports = { addClassTimetable, getClassTimetable };
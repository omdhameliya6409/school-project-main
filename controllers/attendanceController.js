const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// GET: View students by class, section, and date with their attendance status
exports.getStudentsByClassAndSection = async (req, res) => {
  const { class: className, section, date } = req.query;

  try {
    console.log('Received query:', req.query);

    // Validate inputs
    if (!className || !section || !date) {
      return res.status(400).json({ message: 'Class, section, and date are required' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Fetch students by class and section
    const students = await Student.find({
      class: className, // Using 'class' here
      section: section,
    });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found for the given class and section' });
    }

    // Attendance date range
    const startDate = new Date(parsedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(parsedDate);
    endDate.setHours(23, 59, 59, 999);

    // Map attendance status to students
    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        try {
          const attendanceRecord = await Attendance.findOne({
            studentId: student._id,
            attendanceDate: { $gte: startDate, $lte: endDate },
          });

          return {
            admissionNo: student.admissionNo,
            rollNumber: student.rollNo,
            name: student.name,
            attendanceStatus: attendanceRecord
              ? attendanceRecord.attendanceStatus
              : 'No Data',
          };
        } catch (err) {
          console.error(`Error fetching attendance for ${student.admissionNo}: ${err.message}`);
          return {
            admissionNo: student.admissionNo,
            rollNumber: student.rollNo,
            name: student.name,
            attendanceStatus: 'Error',
          };
        }
      })
    );

    res.status(200).json({
      class: `Class ${className}`,
      section,
      date: parsedDate.toISOString().split('T')[0],
      students: studentsWithAttendance.map((student, index) => ({
        number: index + 1,
        ...student,
      })),
    });
  } catch (error) {
    console.error('Error in getStudentsByClassAndSection:', error.message);
    res.status(500).json({ message: error.message });
  }
};
// POST: Add or update Attendance Record (update if already exists)
exports.addAttendance = async (req, res) => {
  const { admissionNo, attendanceDate, attendanceStatus, class: className, section, rollNo, name } = req.body;

  try {
    // Ensure all required fields are provided
    if (!admissionNo || !attendanceDate || !attendanceStatus || !className || !section || !rollNo || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert the attendanceDate to a Date object
    const parsedDate = new Date(attendanceDate);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Check if an attendance record already exists for this student on this date, class, and section
    const existingAttendance = await Attendance.findOne({
      admissionNo,
      attendanceDate: parsedDate,
      class: className,
      section,
    });

    if (existingAttendance) {
      // If attendance exists, update the attendanceStatus with the latest one
      existingAttendance.attendanceStatus = attendanceStatus;
      await existingAttendance.save();
      return res.status(200).json({
        message: 'Attendance status updated successfully',
        data: existingAttendance,
      });
    }

    // If no existing attendance record, create a new one
    const newAttendance = new Attendance({
      admissionNo,
      attendanceDate: parsedDate,
      attendanceStatus,
      class: className,
      section,
      rollNo,
      name,
    });

    // Save the new attendance record
    await newAttendance.save();
    console.log(`Added new attendance record for admissionNo: ${admissionNo}`);

    // Return success response
    res.status(201).json({ message: 'Attendance added successfully', data: newAttendance });

  } catch (error) {
    // Handle duplicate key error (this shouldn't happen if the attendance record is properly checked before insertion)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate attendance record for the same date and class' });
    }
    console.error('Error adding attendance:', error.message);
    res.status(500).json({ message: error.message });
  }
};






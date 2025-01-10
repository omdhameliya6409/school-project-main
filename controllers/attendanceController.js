const Leave = require('../models/Leave'); // Import Leave model
const Attendance = require('../models/Attendance'); // Import Attendance model

// Helper function to parse "DD-MM-YYYY" into a JavaScript Date object
function parseDateFromDDMMYYYY(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // Month is zero-indexed in JavaScript
}

// **Get attendance records with filters**
exports.getAttendances = async (req, res, next) => {
  const { section, class: className, attendanceDate } = req.query;

  if (!section || !className || !attendanceDate) {
    return res.status(400).json({
      status : 400,
      message: "Missing required parameters: section, class, and attendanceDate are required."
    });
  }

  try {
    const filter = {
      section,
      class: className
    };


    // Query the database
    const attendances = await Attendance.find(filter);

    if (attendances.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No attendance records found for the provided filters."
      });
    }

    res.status(200).json(attendances);
  } catch (err) {
    next(err);
  }
};

// **Add a new attendance record**
exports.addAttendance = async (req, res) => {
  try {
    const { admissionNo, rollNo, name, class: className, section, attendanceDate, attendanceStatus } = req.body;


    // Check for existing attendance on the same date
    const existingAttendance = await Attendance.findOne({
      admissionNo,
      attendanceDate,
    });

    if (existingAttendance) {
      return res.status(400).json({ status: 400, message: "Attendance for this date already exists." });
    }

    // Create a new attendance record
    const newAttendance = new Attendance({
      admissionNo,
      rollNo,
      name,
      class: className,
      section,
      attendanceDate,
      attendanceStatus
    });

    await newAttendance.save();

    return res.status(200).json({ status: 200, message: "Attendance added successfully", attendance: newAttendance });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return res.status(500).json({ status: 500, message: "Error adding attendance", error });
  }
};

// **Update attendance status**
exports.updateAttendance = async (req, res, next) => {
  const { id } = req.params;
  const { attendanceStatus } = req.body;

  const validStatuses = ['Present', 'Absent', 'Late'];
  if (!validStatuses.includes(attendanceStatus)) {
    return res.status(400).json({ status: 400, message: "Invalid attendance status" });
  }

  try {
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { attendanceStatus },
      { new: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ status: 404, message: 'Attendance record not found' });
    }

    res.status(200).json(updatedAttendance);
  } catch (err) {
    next(err);
  }
};


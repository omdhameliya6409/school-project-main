const Attendance = require('../models/Attendance');

// Get attendances with filters (section, class, attendanceDate, date range)
exports.getAttendances = async (req, res, next) => {
  const { section, class: className, attendanceDate, startDate, endDate } = req.query;
  
  // Check if required fields are present
  if (!section || !className || !attendanceDate) {
    return res.status(400).json({
      message: "Missing required parameters: section, class, and attendanceDate are required."
    });
  }

  try {
    const filter = {};

    // Filter by section
    filter.section = section;

    // Filter by class
    filter.class = className;

    // Filter by single attendance date
    const parsedAttendanceDate = new Date(attendanceDate);
    if (isNaN(parsedAttendanceDate)) {
      return res.status(400).json({ message: "Invalid attendance date" });
    }
    filter.attendanceDate = parsedAttendanceDate;

    // Filter by date range (startDate to endDate)
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
        return res.status(400).json({ message: "Invalid date range" });
      }
      filter.attendanceDate = { $gte: parsedStartDate, $lte: parsedEndDate };
    }

    const attendances = await Attendance.find(filter);
    res.status(200).json(attendances);
  } catch (err) {
    next(err);
  }
};

exports.addAttendance = async (req, res) => {
  try {
    const { admissionNo, rollNo, name, class: className, section, attendanceDate, attendanceStatus } = req.body;

    // Convert the date to the correct format (DD-MM-YYYY to YYYY-MM-DD)
    const [day, month, year] = attendanceDate.split('-'); // Assuming the date format is DD-MM-YYYY
    const formattedDate = `${year}-${month}-${day}`; // Change it to YYYY-MM-DD

    // Parse the date into a JavaScript Date object
    const parsedAttendanceDate = new Date(formattedDate); 

    // Check if the date is valid
    if (isNaN(parsedAttendanceDate)) {
      return res.status(400).json({ message: "Invalid attendance date" });
    }

    // Try to find the attendance record for this student and date to prevent duplicates
    const existingAttendance = await Attendance.findOne({
      admissionNo,
      attendanceDate: parsedAttendanceDate
    });

    if (existingAttendance) {
      return res.status(400).json({ message: "Attendance for this date already exists" });
    }

    // Create a new attendance record for this student on the selected date
    const newAttendance = new Attendance({
      admissionNo,
      rollNo,
      name,
      class: className,
      section,
      attendanceDate: parsedAttendanceDate,
      attendanceStatus
    });

    await newAttendance.save();

    return res.status(201).json({ message: "Attendance added successfully", attendance: newAttendance });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return res.status(500).json({ message: "Error adding attendance", error });
  }
};


// Update an existing attendance record (change attendance status)
exports.updateAttendance = async (req, res, next) => {
  const { id } = req.params;
  const { attendanceStatus } = req.body;

  // Validate the new attendance status
  const validStatuses = ['Present', 'Absent', 'Late']; 
  if (!validStatuses.includes(attendanceStatus)) {
    return res.status(400).json({ message: "Invalid attendance status" });
  }

  try {
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { attendanceStatus },
      { new: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json(updatedAttendance);
  } catch (err) {
    next(err);
  }
};

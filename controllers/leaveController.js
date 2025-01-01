const Leave = require('../models/Leave'); // Import Leave model
const Attendance = require('../models/Attendance'); // Import Attendance model

// Helper function to parse "DD-MM-YYYY" into a JavaScript Date object
function parseDateFromDDMMYYYY(dateStr) {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // Month is zero-indexed in JavaScript
}

// Apply for leave API
exports.applyLeave = async (req, res) => {
  try {
    const { name, class: className, section, applyDate, fromDate, toDate, status } = req.body;

    if (!name || !className || !section || !applyDate || !fromDate || !toDate || !status) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: name, class, section, applyDate, fromDate, toDate, and status are required."
      });
    }

    // Parse dates
    const parsedApplyDate = parseDateFromDDMMYYYY(applyDate);
    const parsedFromDate = parseDateFromDDMMYYYY(fromDate);
    const parsedToDate = parseDateFromDDMMYYYY(toDate);

    if (isNaN(parsedApplyDate) || isNaN(parsedFromDate) || isNaN(parsedToDate)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid date format. Use DD-MM-YYYY."
      });
    }

    if (parsedFromDate > parsedToDate) {
      return res.status(400).json({
        status: 400,
        message: "'fromDate' cannot be after 'toDate'."
      });
    }

    // Check for existing leave
    const existingLeave = await Leave.findOne({
      name,
      class: className,
      section,
      $or: [
        {
          fromDate: { $lte: parsedToDate },
          toDate: { $gte: parsedFromDate }
        }
      ]
    });

    if (existingLeave) {
      return res.status(400).json({
        status: 400,
        message: "Leave already exists for the given period."
      });
    }

    // Create leave record
    const leave = new Leave({
      name,
      class: className,
      section,
      applyDate: parsedApplyDate,
      fromDate: parsedFromDate,
      toDate: parsedToDate,
      status
    });

    await leave.save();

    // If the leave is approved, mark the student as absent for the period
    if (status === 'Approved') {
      const attendanceRecords = [];
      let currentDate = new Date(parsedFromDate);

      while (currentDate <= parsedToDate) {
        // Check if attendance already exists for the date
        const existingAttendance = await Attendance.findOne({
          name,
          class: className,
          section,
          attendanceDate: {
            $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
            $lte: new Date(currentDate.setHours(23, 59, 59, 999))
          }
        });

        if (!existingAttendance) {
          attendanceRecords.push({
            name,
            class: className,
            section,
            attendanceDate: new Date(currentDate),
            attendanceStatus: 'Absent'
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (attendanceRecords.length > 0) {
        await Attendance.insertMany(attendanceRecords);
      }
    }

    return res.status(200).json({
      status: 200,
      message: "Leave applied successfully.",
      leave
    });
  } catch (error) {
    console.error("Error applying leave:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while applying for leave.",
      error
    });
  }
};

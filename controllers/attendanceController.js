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
      message: "Missing required parameters: section, class, and attendanceDate are required."
    });
  }

  try {
    const filter = {
      section,
      class: className
    };

    // Parse the attendanceDate from "DD-MM-YYYY"
    const parsedDate = parseDateFromDDMMYYYY(attendanceDate);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ status: 400, message: "Invalid attendance date format. Use DD-MM-YYYY." });
    }

    // Filter for the start and end of the day
    filter.attendanceDate = {
      $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
      $lte: new Date(parsedDate.setHours(23, 59, 59, 999))
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

    // Parse the attendanceDate from "DD-MM-YYYY"
    const parsedAttendanceDate = parseDateFromDDMMYYYY(attendanceDate);
    if (isNaN(parsedAttendanceDate)) {
      return res.status(400).json({ status: 400, message: "Invalid attendance date format. Use DD-MM-YYYY." });
    }

    // Check for existing attendance on the same date
    const existingAttendance = await Attendance.findOne({
      admissionNo,
      attendanceDate: {
        $gte: new Date(parsedAttendanceDate.setHours(0, 0, 0, 0)),
        $lte: new Date(parsedAttendanceDate.setHours(23, 59, 59, 999))
      }
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
      attendanceDate: parsedAttendanceDate,
      attendanceStatus
    });

    await newAttendance.save();

    return res.status(201).json({ status: 201, message: "Attendance added successfully", attendance: newAttendance });
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
// Helper function to format the date to DD-MM-YYYY format
function formatDateToDDMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Helper function to parse dates from DD-MM-YYYY format to Date object
function parseDateFromDDMMYYYY(dateStr) {
  const [day, month, year] = dateStr.split('-');
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return date;
}



// POST - Apply Leave
exports.applyLeave = async (req, res) => {
  try {
    const { name, class: className, section, applyDate, fromDate, toDate, status, reason, admissionNo } = req.body;

    if (!name || !className || !section || !applyDate || !fromDate || !toDate || !status || !reason || !admissionNo) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: name, class, section, applyDate, fromDate, toDate, status, reason, and admissionNo are required."
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

    // Check for existing leave record for the same student (admissionNo) with the same date range
    const existingLeave = await Leave.findOne({
      admissionNo,
      applyDate: parsedApplyDate,
      fromDate: parsedFromDate,
      toDate: parsedToDate
    });

    if (existingLeave) {
      return res.status(400).json({
        status: 400,
        message: "Leave record with the same dates already exists for this student."
      });
    }

    // Create leave record
    const leave = new Leave({
      admissionNo,
      name,
      class: className,
      section,
      applyDate: parsedApplyDate,
      fromDate: parsedFromDate,
      toDate: parsedToDate,
      status,
      reason
    });

    await leave.save();

    // Convert dates to "DD-MM-YYYY" format for response
    const formattedLeave = {
      admissionNo: leave.admissionNo, // Show admissionNo first
      _id: leave._id,
      name: leave.name,
      class: leave.class,
      section: leave.section,
      applyDate: formatDateToDDMMYYYY(leave.applyDate),
      fromDate: formatDateToDDMMYYYY(leave.fromDate),
      toDate: formatDateToDDMMYYYY(leave.toDate),
      status: leave.status,
      reason: leave.reason,
      __v: leave.__v,
    };

    return res.status(201).json({
      status: 201,
      message: "Leave applied successfully.",
      leave: formattedLeave
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



// PUT - Edit Leave
exports.editLeave = async (req, res) => {
  try {
    const { leaveId } = req.params; // Leave ID from URL params
    const { name, class: className, section, applyDate, fromDate, toDate, status, reason, admissionNo } = req.body;

    // Check for missing required fields
    if (!name || !className || !section || !applyDate || !fromDate || !toDate || !status || !reason || !admissionNo) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: name, class, section, applyDate, fromDate, toDate, status, reason, and admissionNo are required."
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

    // Find the leave record to update
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({
        status: 404,
        message: "Leave record not found."
      });
    }

    // Check for existing leave record with the same admissionNo and same dates
    const existingLeave = await Leave.findOne({
      admissionNo,
      applyDate: parsedApplyDate,
      fromDate: parsedFromDate,
      toDate: parsedToDate,
    });

    if (existingLeave && existingLeave._id.toString() !== leaveId) {
      return res.status(400).json({
        status: 400,
        message: "Leave record with the same dates already exists for this student."
      });
    }

    // Update the leave record
    leave.name = name;
    leave.class = className;
    leave.section = section;
    leave.applyDate = parsedApplyDate;
    leave.fromDate = parsedFromDate;
    leave.toDate = parsedToDate;
    leave.status = status;
    leave.reason = reason;

    // Save the updated leave record
    await leave.save();

    // Format the dates before sending the response
    const formattedLeave = {
      admissionNo: leave.admissionNo, // Show admissionNo first
      _id: leave._id,
      name: leave.name,
      class: leave.class,
      section: leave.section,
      applyDate: formatDateToDDMMYYYY(leave.applyDate),
      fromDate: formatDateToDDMMYYYY(leave.fromDate),
      toDate: formatDateToDDMMYYYY(leave.toDate),
      status: leave.status,
      reason: leave.reason,
      __v: leave.__v,
    };

    return res.status(200).json({
      status: 200,
      message: "Leave updated successfully.",
      leave: formattedLeave
    });
  } catch (error) {
    console.error("Error updating leave:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while updating leave.",
      error: error.message
    });
  }
};
// DELETE - Delete Leave by ID
exports.deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params; // Leave ID from URL params

    // Find the leave record by ID and delete it
    const leave = await Leave.findByIdAndDelete(leaveId);

    // If leave not found, return an error
    if (!leave) {
      return res.status(404).json({
        status: 404,
        message: "Leave record not found."
      });
    }

    // Return success response
    return res.status(200).json({
      status: 200,
      message: "Leave deleted successfully.",
      leaveId: leaveId
    });
  } catch (error) {
    console.error("Error deleting leave:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while deleting leave.",
      error: error.message
    });
  }
};
// // GET - Filter Leaves by Class and Section
// exports.filterByClassAndSection = async (req, res) => {
//   try {
//     const { className, section } = req.query; // Get class and section from query params

//     // Validate if both class and section are provided
//     if (!className || !section) {
//       return res.status(400).json({
//         status: 400,
//         message: "Both 'class' and 'section' are required."
//       });
//     }

//     // Find leave records based on class and section
//     const leaves = await Leave.find({ class: className, section: section });

//     // If no records are found, return a message
//     if (leaves.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         message: "No leave records found for the specified class and section."
//       });
//     }

//     // Format the leave records (optional: you can format the dates if needed)
//     const formattedLeaves = leaves.map(leave => ({
//       ...leave.toObject(),
//       applyDate: formatDateToDDMMYYYY(leave.applyDate),
//       fromDate: formatDateToDDMMYYYY(leave.fromDate),
//       toDate: formatDateToDDMMYYYY(leave.toDate),
//     }));

//     // Return the filtered leave records
//     return res.status(200).json({
//       status: 200,
//       message: "Leave records fetched successfully.",
//       leaves: formattedLeaves
//     });

//   } catch (error) {
//     console.error("Error fetching leave records:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "An error occurred while fetching leave records.",
//       error: error.message
//     });
//   }
// };

exports.LeavefilterByClassAndSection = async (req, res) => {
  try {
    const { class: className, section } = req.query; // Rename 'class' to 'className'
    
    console.log("Query Parameters:", req.query);  // Log the query parameters

    if (!className || !section) {
      return res.status(400).json({
        status: 400,
        message: "Both 'class' and 'section' are required."
      });
    }

    const leaves = await Leave.find({ class: className, section: section });

    if (leaves.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No leave records found for the specified class and section."
      });
    }

    const formattedLeaves = leaves.map(leave => ({
      ...leave.toObject(),
      applyDate: formatDateToDDMMYYYY(leave.applyDate),
      fromDate: formatDateToDDMMYYYY(leave.fromDate),
      toDate: formatDateToDDMMYYYY(leave.toDate),
    }));

    return res.status(200).json({
      status: 200,
      message: "Leave records fetched successfully.",
      leaves: formattedLeaves
    });

  } catch (error) {
    console.error("Error fetching leave records:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while fetching leave records.",
      error: error.message
    });
  }
};

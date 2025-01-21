const Leave = require('../models/Leave'); 

function formatDateToDDMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function parseDateFromDDMMYYYY(dateStr) {
  const [day, month, year] = dateStr.split('-');
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return date;
}

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

  
    const formattedLeave = {
      admissionNo: leave.admissionNo, 
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




exports.editLeave = async (req, res) => {
  try {
    const { leaveId } = req.params; 
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

    // Find the leave record to update
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({
        status: 404,
        message: "Leave record not found."
      });
    }

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


    leave.name = name;
    leave.class = className;
    leave.section = section;
    leave.applyDate = parsedApplyDate;
    leave.fromDate = parsedFromDate;
    leave.toDate = parsedToDate;
    leave.status = status;
    leave.reason = reason;


    await leave.save();

    const formattedLeave = {
      admissionNo: leave.admissionNo, 
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

exports.deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params; 


    const leave = await Leave.findByIdAndDelete(leaveId);

    
    if (!leave) {
      return res.status(404).json({
        status: 404,
        message: "Leave record not found."
      });
    }


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
    const { class: className, section } = req.query; 
    
    console.log("Query Parameters:", req.query); 

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
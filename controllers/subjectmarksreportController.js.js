const SubjectMarksReport = require("../models/SubjectMarksReport"); // Ensure the casing matches

// // Create a new subject marks report
// exports.createSubjectMarksReport = async (req, res) => {
//     const { admissionNo, name, rollNo, class: studentClass, section, reports } = req.body;

//     try {
//         // Iterate through the list of reports and create them one by one
//         const createdReports = [];
//         for (const reportData of reports) {
//             const { subject, totalmarks, marksobtained, passorfail } = reportData;

//             // Check if a report already exists for the given admissionNo and subject
//             const existingReport = await SubjectMarksReport.findOne({ admissionNo, subject });
//             if (existingReport) {
//                 return res.status(400).json({
//                     message: `A report for admissionNo ${admissionNo} and subject '${subject}' already exists.`,
//                 });
//             }

//             // Create a new subject marks report
//             const report = new SubjectMarksReport({
//                 admissionNo,
//                 name,
//                 rollNo,
//                 class: studentClass,
//                 section,
//                 subject,
//                 totalmarks,
//                 marksobtained,
//                 passorfail,
//             });

//             // Save the document to MongoDB
//             const savedReport = await report.save();
//             createdReports.push(savedReport); // Add the created report to the array
//         }

//         // Send success response with all created reports
//         res.status(201).json({
//             message: "Subject Marks Reports created successfully",
//             data: createdReports,
//         });
//     } catch (error) {
//         console.error("Error creating report:", error);
//         res.status(500).json({
//             message: "Failed to create reports",
//             error: error.message,
//         });
//     }
// };




// Create a new subject marks report for a single subject
exports.createSubjectMarksReport = async (req, res) => {
    const { admissionNo, name, rollNo, class: studentClass, section, subject, totalmarks, marksobtained, passorfail } = req.body;

    try {
        // Check if a report already exists for the given admissionNo and subject
        const existingReport = await SubjectMarksReport.findOne({ admissionNo, subject });
        if (existingReport) {
            return res.status(400).json({
                message: `A report for admissionNo ${admissionNo} and subject '${subject}' already exists.`,
            });
        }

        // Create a new subject marks report
        const report = new SubjectMarksReport({
            admissionNo,
            name,
            rollNo,
            class: studentClass,
            section,
            subject,
            totalmarks,
            marksobtained,
            passorfail,
        });

        // Save the document to MongoDB
        await report.save();

        // Send success response
        res.status(201).json({
            message: "Subject Marks Report created successfully",
            data: report,
        });
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({
            message: "Failed to create report",
            error: error.message,
        });
    }
};

// Edit a subject marks report by ID
exports.editSubjectMarksReport = async (req, res) => {
    const { id } = req.params;  // Get the report ID from the URL parameter
    const { admissionNo, name, rollNo, class: studentClass, section, subject, totalmarks, marksobtained, passorfail } = req.body;

    try {
        // Check if the report already exists with the same admissionNo and subject
        const existingReport = await SubjectMarksReport.findOne({
            admissionNo,
            subject,
            _id: { $ne: id }, // Exclude the current document (to allow editing the current one)
        });

        if (existingReport) {
            return res.status(400).json({
                message: `A report for admissionNo ${admissionNo} and subject '${subject}' already exists.`,
            });
        }

        // Find the report by ID
        const report = await SubjectMarksReport.findById(id);
        if (!report) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        // Update the report with the new data
        report.admissionNo = admissionNo;
        report.name = name;
        report.rollNo = rollNo;
        report.class = studentClass;
        report.section = section;
        report.subject = subject;
        report.totalmarks = totalmarks;
        report.marksobtained = marksobtained;
        report.passorfail = passorfail;

        // Save the updated report to the database
        const updatedReport = await report.save();

        // Return the updated report
        res.status(200).json({
            message: "Subject Marks Report updated successfully",
            data: updatedReport,
        });
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({
            message: "Failed to update report",
            error: error.message,
        });
    }
};

// Delete a subject marks report by ID
exports.deleteSubjectMarksReport = async (req, res) => {
    const { id } = req.params;  // Get the report ID from the URL parameter

    try {
        // Find and delete the report by ID
        const deletedReport = await SubjectMarksReport.findByIdAndDelete(id);

        // If the report does not exist, return an error message
        if (!deletedReport) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        // Return success message if deletion is successful
        res.status(200).json({
            message: "Subject Marks Report deleted successfully",
            data: deletedReport,
        });
    } catch (error) {
        console.error("Error deleting report:", error);
        res.status(500).json({
            message: "Failed to delete report",
            error: error.message,
        });
    }
};




// Get all subject marks reports
exports.getAllSubjectMarksReports = async (req, res) => {
    try {
        // Retrieve all reports from the database
        const reports = await SubjectMarksReport.find();

        // If no reports found, return a message
        if (reports.length === 0) {
            return res.status(404).json({
                message: "No reports found",
            });
        }

        // Return all the reports
        res.status(200).json({
            message: "Subject Marks Reports fetched successfully",
            data: reports,
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({
            message: "Failed to fetch reports",
            error: error.message,
        });
    }
};

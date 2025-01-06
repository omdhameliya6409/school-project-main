const express = require("express");
const router = express.Router();
const subjectMarksReportController = require("../controllers/subjectmarksreportController"); // Adjust the path if necessary

// Create a new subject marks report
router.post("/add", subjectMarksReportController.createSubjectMarksReport);

// Get all subject marks reports
router.get("/list", subjectMarksReportController.getAllSubjectMarksReports);

// Update a subject marks report by ID
router.put("/edit/:id", subjectMarksReportController.editSubjectMarksReport);

// Delete a subject marks report by ID
router.delete("/delete/:id", subjectMarksReportController.deleteSubjectMarksReport);

module.exports = router;

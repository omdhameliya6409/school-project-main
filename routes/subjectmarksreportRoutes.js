const express = require("express");
const router = express.Router();
const subjectMarksReportController = require("../controllers/subjectmarksreportController"); // Adjust the path if necessary


router.post("/add", subjectMarksReportController.createSubjectMarksReport);


router.get("/list", subjectMarksReportController.getAllSubjectMarksReports);


router.put("/edit/:id", subjectMarksReportController.editSubjectMarksReport);


router.delete("/delete/:id", subjectMarksReportController.deleteSubjectMarksReport);

module.exports = router;

const express = require("express");
const router = express.Router();
const { createSubjectMarksReport, editSubjectMarksReport, deleteSubjectMarksReport, getAllSubjectMarksReports } = require("../controllers/subjectmarksreportController.js"); // Adjust the path

router.post("/add", createSubjectMarksReport);
router.put("/edit/:id", editSubjectMarksReport);
router.delete("/delete/:id", deleteSubjectMarksReport);
router.get("/list" , getAllSubjectMarksReports)
module.exports = router;

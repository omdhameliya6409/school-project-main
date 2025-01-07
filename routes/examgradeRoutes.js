const express = require("express");
const router = express.Router();

const examGradeController = require("../controllers/examgradeController");

// Create a new exam grade
router.post("/add", examGradeController.createExamGrade);

// Get all exam grades
router.put("/edit/:id", examGradeController.updateExamGrade);

router.delete("/delete/:id", examGradeController.deleteExamGrade);

router.get("/list", examGradeController.getAllExamGrades);
module.exports = router;

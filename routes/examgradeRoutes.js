const express = require("express");
const router = express.Router();

const examGradeController = require("../controllers/examgradeController");


router.post("/add", examGradeController.createExamGrade);


router.put("/edit/:id", examGradeController.updateExamGrade);

router.delete("/delete/:id", examGradeController.deleteExamGrade);

router.get("/list", examGradeController.getAllExamGrades);
module.exports = router;

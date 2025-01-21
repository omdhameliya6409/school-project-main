
const express = require('express');
const router = express.Router();
const upload = require('../fileUploadHandler'); 



const studentController = require('../controllers/studentprofileController');
router.get('/profile', studentController.getStudentProfile);
router.get('/profile/FeeDetails', studentController.getFeeDetails);
router.get('/profile/ExamSchedule', studentController.getExamSchedule);
router.get('/profile/Attendance', studentController.getAttendance);
router.get('/profile/ExamGrade', studentController.getExamGrade);
router.get('/profile/ClassTimetable', studentController.getClassTimetable);
router.get('/profile/LiveClassMeeting', studentController.LiveClassMeeting);
router.get('/profile/Leave', studentController.Leave);
router.get('/profile/Booksshow', studentController.getStudentBooks);
router.post("/students/library/:bookId", studentController.borrowBook);
router.put("/students/library/edit/:bookId", studentController.editBorrowedBook);
router.get('/profile/assignmentschedules', studentController.getAssignmentsForStudent);
router.put('/profile/assignmentschedules/:assignmentId', upload.single('file'), studentController.updateStudentSubmissionStatusWithFile);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const subjectController = require('../controllers/subjectController');


router.post('/add', authMiddleware(["principalAccess", "teacherAccess"]),subjectController.addSubject);


router.put('/edit/:id', authMiddleware(["principalAccess", "teacherAccess"]), subjectController.editSubject);


router.get('/list', authMiddleware(["principalAccess", "teacherAccess"]) , subjectController.getSubjects);

router.delete('/delete/:id', authMiddleware(["principalAccess", "teacherAccess"]), subjectController.deleteSubject);

module.exports = router;

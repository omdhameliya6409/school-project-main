// routes/subjects.js

const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const subjectController = require('../controllers/subjectController');

// POST: Add a new subject
router.post('/add', authMiddleware(["principalAccess", "teacherAccess"]),subjectController.addSubject);

// PUT: Edit an existing subject
router.put('/edit/:id', authMiddleware(["principalAccess", "teacherAccess"]), subjectController.editSubject);

// GET: Get all subjects
router.get('/list', authMiddleware(["principalAccess", "teacherAccess"]) , subjectController.getSubjects);

// DELETE: Delete a subject
router.delete('/delete/:id', authMiddleware(["principalAccess", "teacherAccess"]), subjectController.deleteSubject);

module.exports = router;

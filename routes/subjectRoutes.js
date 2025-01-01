// routes/subjects.js

const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// POST: Add a new subject
router.post('/add', subjectController.addSubject);

// PUT: Edit an existing subject
router.put('/edit/:id', subjectController.editSubject);

// GET: Get all subjects
router.get('/list', subjectController.getSubjects);

// DELETE: Delete a subject
router.delete('/delete/:id', subjectController.deleteSubject);

module.exports = router;

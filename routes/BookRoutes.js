const express = require('express');
const bookController = require('../controllers/bookController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


router.post('/add', authMiddleware(['principalAccess', 'teacherAccess']) ,bookController.addBook);
router.get('/', authMiddleware(['principalAccess', 'teacherAccess']) ,bookController.getAllBooks);
router.put('/edit/:id',authMiddleware(['principalAccess', 'teacherAccess']) , bookController.editBook);
router.delete('/delete/:id',authMiddleware(['principalAccess', 'teacherAccess']) , bookController.deleteBook);

module.exports = router;

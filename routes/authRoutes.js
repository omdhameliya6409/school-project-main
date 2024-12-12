const express = require('express');
const router = express.Router();
const {login, logout} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Login route
router.post('/login',login);
router.post('/logout', authMiddleware(['studentAccess', 'teacherAccess', 'principalAccess']), logout);
module.exports = router;

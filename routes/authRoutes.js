const express = require('express');
const router = express.Router();
const {login, logout, isLoggedIn} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Login route
router.post('/login',login);
router.post('/logout', authMiddleware(['studentAccess', 'teacherAccess', 'principalAccess']), logout);
router.get('/is-logged-in', isLoggedIn);
module.exports = router;

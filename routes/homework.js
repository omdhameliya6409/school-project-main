const express = require('express');
const router = express.Router();
const {
  createHomework,
  getHomeworkByFilters,
  updateHomework,
  deleteHomework,
} = require('../controllers/homeworkController');

// Homework routes
router.post('/add', createHomework); 
router.get('/list', getHomeworkByFilters); 
router.put('/edit/:id', updateHomework); 
router.delete('/delete/:id', deleteHomework); 

module.exports = router;

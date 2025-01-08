const express = require('express');
const { LeavefilterByClassAndSection,applyLeave, editLeave , deleteLeave} = require('../controllers/leaveController');
const router = express.Router();

router.get("/list", LeavefilterByClassAndSection); 
router.post('/add',applyLeave );
router.put('/edit/:leaveId', editLeave);
router.delete('/delete/:leaveId',deleteLeave);

module.exports = router;
const express = require("express");
const {
  getAttendances,
  addAttendance,
  updateAttendance,
  applyLeave,
  editLeave,
  deleteLeave,
} = require("../controllers/attendanceController");

const router = express.Router();

router.get("/Attendanceslist", getAttendances); 
router.post("/add", addAttendance);       
router.put("/:id", updateAttendance);   
// Route to apply for leave
router.post('/apply',applyLeave );
router.put('/leave/edit/:leaveId', editLeave);
router.delete('/leave/delete/:leaveId',deleteLeave)
module.exports = router;

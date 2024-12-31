const express = require("express");
const {
  getAttendances,
  addAttendance,
  updateAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.get("/Attendanceslist", getAttendances); 
router.post("/add", addAttendance);       
router.put("/:id", updateAttendance);   

module.exports = router;

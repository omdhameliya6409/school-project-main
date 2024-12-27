const express = require("express");
const {
  createLiveClassMeeting,
  getAllLiveClassMeetings,
  getClassReport,
} = require("../controllers/liveClassMeetingController");

const router = express.Router();

router.post("/live-class-meetings", createLiveClassMeeting);
router.get("/live-class-meetings", getAllLiveClassMeetings);
router.get("/class-report", getClassReport);
module.exports = router;

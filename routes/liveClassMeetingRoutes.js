const express = require("express");
const {
  createLiveClassMeeting,
  getAllLiveClassMeetings,
  getClassReport,
} = require("../controllers/liveClassMeetingController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.post(
  "/live-class-meetings",
  authMiddleware(["principalAccess", "teacherAccess"]),
  createLiveClassMeeting
);


router.get(
  "/live-class-meetings",
  authMiddleware(["principalAccess", "teacherAccess"]),
  getAllLiveClassMeetings
);


router.get(
  "/class-report",
  authMiddleware(["principalAccess", "teacherAccess"]),
  getClassReport
);

module.exports = router;

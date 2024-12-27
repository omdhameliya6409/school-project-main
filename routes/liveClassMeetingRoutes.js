const express = require("express");
const {
  createLiveClassMeeting,
  getAllLiveClassMeetings,
  getClassReport,
} = require("../controllers/liveClassMeetingController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to create a live class meeting (requires role-based access)
router.post(
  "/live-class-meetings",
  authMiddleware(["principalAccess", "teacherAccess"]),
  createLiveClassMeeting
);

// Route to get all live class meetings (requires role-based access)
router.get(
  "/live-class-meetings",
  authMiddleware(["principalAccess", "teacherAccess"]),
  getAllLiveClassMeetings
);

// Route to get a class report (requires role-based access)
router.get(
  "/class-report",
  getClassReport
);

module.exports = router;

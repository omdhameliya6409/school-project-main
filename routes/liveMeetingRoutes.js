const express = require("express");
const LiveMeeting = require("../models/LiveMeeting");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a Live Meeting (POST)
router.post("/live-meetings", async (req, res) => {
  try {
    const {
      meetingTitle,
      description,
      dateTime,
      meetingDuration,
      apiUsed,
      createdBy,
    } = req.body;

    // Validate input
    if (!meetingTitle || !description || !dateTime || !meetingDuration || !apiUsed || !createdBy) {
      return res.status(400).json({ status: 400, message: "All fields are required." });
    }

    // Create and save the live meeting
    const liveMeeting = new LiveMeeting({
      meetingTitle,
      description,
      dateTime,
      meetingDuration,
      apiUsed,
      createdBy,
    });
    const savedMeeting = await liveMeeting.save();

    res.status(200).json({
      status: 200,
      message: "Live meeting created successfully",
      data: savedMeeting,
    });
  } catch (error) {
    console.error("Error creating live meeting:", error.message);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

// Get All Live Meetings (GET)
router.get("/live-meetings",authMiddleware(['principalAccess', 'teacherAccess']) ,  async (req, res) => {
  try {
    const liveMeetings = await LiveMeeting.find().sort({ dateTime: 1 }); // Sort by dateTime
    res.status(200).json({
      status: 200,
      message: "Live meetings fetched successfully",
      data: liveMeetings,
    });
  } catch (error) {
    console.error("Error fetching live meetings:", error.message);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});


// Get All Live Meetings (GET)
router.get("/live-meetings/report", authMiddleware(['principalAccess', 'teacherAccess']), async (req, res) => {
  try {
    const liveMeetings = await LiveMeeting.find().sort({ dateTime: 1 }); // Fetch and sort meetings

    // Add a random number for totalJoin
    const meetingsWithRandomTotalJoin = liveMeetings.map((meeting) => {
      return {
        ...meeting.toObject(),
        totalJoin: Math.floor(Math.random() * 101), // Random number between 0 and 100
      };
    });

    res.status(200).json({
      status: 200,
      message: "Live meetings fetched successfully with random Total Join",
      data: meetingsWithRandomTotalJoin,
    });
  } catch (error) {
    console.error("Error fetching live meetings:", error.message);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});
// Export the router
module.exports = router;

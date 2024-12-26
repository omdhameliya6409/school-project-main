const express = require("express");
const LiveMeeting = require("../models/LiveMeeting");

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

    res.status(201).json({
      status: 201,
      message: "Live meeting created successfully",
      data: savedMeeting,
    });
  } catch (error) {
    console.error("Error creating live meeting:", error.message);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

// Get All Live Meetings (GET)
router.get("/live-meetings", async (req, res) => {
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

// Export the router
module.exports = router;

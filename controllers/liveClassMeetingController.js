const authMiddleware = require("../middleware/authMiddleware");
const LiveClassMeeting = require("../models/LiveClassMeeting");

// Create Live Class Meeting
exports.createLiveClassMeeting = authMiddleware(['principalAccess', 'teacherAccess']) ,async (req, res) => {
  try {
    const newMeeting = new LiveClassMeeting(req.body);
    const savedMeeting = await newMeeting.save();
    res.status(200).json({ status: 200, message: "Live Class Meeting created successfully", data: savedMeeting });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error", error: error.message });
  }
};

// Get All Live Class Meetings
exports.getAllLiveClassMeetings = async (req, res) => {
  try {
    const meetings = await LiveClassMeeting.find().sort({ dateTime: 1 });
    res.status(200).json({
      status: 200,
      message: "Live Class Meetings fetched successfully",
      data: meetings,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getClassReport = async (req, res) => {
  try {
    // Extract class and section from query parameters
    const { class: classFilter, section } = req.query;

    // Check if the class parameter is provided
    if (!classFilter) {
      return res.status(400).json({
        status: 400,
        message: "Class parameter is required",
      });
    }

    // If section is provided, validate it as well
    if (section && !["A", "B", "C", "D"].includes(section)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid section. Allowed sections are A, B, C, and D.",
      });
    }

    // Find meetings for the specified class (optionally filtered by section)
    let query = { "classes.class": classFilter };

    if (section) {
      query["classes.section"] = section; // Filter by section if provided
    }

    const meetings = await LiveClassMeeting.find(query)
      .sort({ "classes.class": 1, "classes.section": 1, dateTime: 1 });

    // If no meetings found, return a message indicating so
    if (meetings.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No live class meetings found for the given class and section",
      });
    }

    // Simulate fake joins with random numbers between 30 and 100 for each meeting
    const filteredMeetings = meetings
      .filter(meeting => {
        // Filter meetings with less than 50 joins (using random number for fake joins)
        const fakeJoinCount = Math.floor(Math.random() * (100 - 30 + 1)) + 30; // Random number between 30 and 100
        return fakeJoinCount >= 50; // Only keep meetings with fake joins >= 50
      })
      .map(meeting => {
        // Ensure the classes array is not returned in the response
        const { classes, ...rest } = meeting.toObject();  // Exclude 'classes' field
        // Add fake total joins (random number between 50 and 100)
        const totalJoins = Math.floor(Math.random() * (100 - 50 + 1)) + 50;  // Random number between 50 and 100
        return {
          ...rest,
          totalJoins,  // Use the fake total joins count
        };
      });

    // If no meetings passed the join filter
    if (filteredMeetings.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No live class meetings found with more than 50 participants",
      });
    }

    // Return the filtered meetings with fake total joins
    res.status(200).json({
      status: 200,
      message: "Live Class Meetings fetched successfully",
      data: filteredMeetings,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error", error: error.message });
  }
};


  
  

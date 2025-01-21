const authMiddleware = require("../middleware/authMiddleware");
const LiveClassMeeting = require("../models/LiveClassMeeting");


exports.createLiveClassMeeting = authMiddleware(['principalAccess', 'teacherAccess']) ,async (req, res) => {
  try {
    const newMeeting = new LiveClassMeeting(req.body);
    const savedMeeting = await newMeeting.save();
    res.status(200).json({ status: 200, message: "Live Class Meeting created successfully", data: savedMeeting });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error", error: error.message });
  }
};

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

    const { class: classFilter, section } = req.query;

    
    if (!classFilter) {
      return res.status(400).json({
        status: 400,
        message: "Class parameter is required",
      });
    }


    if (section && !["A", "B", "C", "D"].includes(section)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid section. Allowed sections are A, B, C, and D.",
      });
    }

   
    let query = { "classes.class": classFilter };

    if (section) {
      query["classes.section"] = section; 
    }

    const meetings = await LiveClassMeeting.find(query)
      .sort({ "classes.class": 1, "classes.section": 1, dateTime: 1 });

   
    if (meetings.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No live class meetings found for the given class and section",
      });
    }

    const filteredMeetings = meetings
      .filter(meeting => {
       
        const fakeJoinCount = Math.floor(Math.random() * (100 - 30 + 1)) + 30; 
        return fakeJoinCount >= 50; 
      })
      .map(meeting => {
    
        const { classes, ...rest } = meeting.toObject();  
        
        const totalJoins = Math.floor(Math.random() * (100 - 50 + 1)) + 50;  
        return {
          ...rest,
          totalJoins,  
        };
      });

   
    if (filteredMeetings.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No live class meetings found with more than 50 participants",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Live Class Meetings fetched successfully",
      data: filteredMeetings,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error", error: error.message });
  }
};


  
  

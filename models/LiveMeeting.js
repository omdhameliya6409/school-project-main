const mongoose = require("mongoose");

const liveMeetingSchema = new mongoose.Schema({
  meetingTitle: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  meetingDuration: {
    type: Number,
    required: true,
  },
  apiUsed: {
    type: String,
    required: true,
    enum: ["Global", "Local"],
  },
  createdBy: {
    type: String,
    required: true,
  },
}, { timestamps: true }); 

const LiveMeeting = mongoose.model("LiveMeeting", liveMeetingSchema);

module.exports = LiveMeeting;

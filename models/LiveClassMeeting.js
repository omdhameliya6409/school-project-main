const mongoose = require("mongoose");

const LiveClassMeetingSchema = new mongoose.Schema({
  classTitle: { type: String, required: true },
  description: { type: String, required: true },
  dateTime: { type: Date, required: true },
  classDuration: { type: Number, required: true },
  apiUsed: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdFor: { type: String, required: true },
  classes: [
    {
      class: { type: Number, required: true },
      section: { type: String, required: true },
    },
  ],
  status: { type: String, default: "Awaited" },
});

module.exports = mongoose.model("LiveClassMeeting", LiveClassMeetingSchema);

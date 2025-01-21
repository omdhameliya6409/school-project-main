

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  activeToken: { type: String, default: null },
  principalAccess: { type: Boolean, default: false },
  teacherAccess: { type: Boolean, default: false },
  studentAccess: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);

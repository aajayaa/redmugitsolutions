const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  fbLink: { type: String },
  instaLink: { type: String },
  xLink: { type: String },
  linkedinLink: { type: String },
  pictures: { type: [String], default: ["/uploads/no-img.jpeg"] },
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;

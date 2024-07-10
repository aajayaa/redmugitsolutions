const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  picture: { type: [String], default: ["/uploads/no-logo.jpeg"] },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;

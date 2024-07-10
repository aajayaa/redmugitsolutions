const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: [String], default: ["/uploads/no-logo.jpeg"] },
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;

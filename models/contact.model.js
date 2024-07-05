const mongoose = require("mongoose");
// mongoose.connect('mongodb+srv://redmugitsolution:yYIc0rX4kv1Ux0e6@redmugitsolutions.y46nyym.mongodb.net/redmugitsolutions');

const contactSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
});

module.exports = mongoose.model("contact", contactSchema);

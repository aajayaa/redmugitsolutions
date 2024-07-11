const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/update-settings", upload.single("photo"), async (req, res) => {
  try {
    const { email, name, current_password, new_password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(current_assword);
    if (!isMatch) {
      return res.status(400).send({ message: "Current password is incorrect" });
    }

    user.name = name;
    if (password) {
      user.password = new_password;
    }
    if (req.file) {
      user.photo = req.file.path;
    }

    await user.save();

    res.send({ message: "Settings updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;

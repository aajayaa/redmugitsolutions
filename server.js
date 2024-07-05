require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const port = 3000;
const path = require("path");
const contactModel = require("./models/contact.model");
const User = require("./models/user.model");
const db = require("./connection");

app.use(bodyParser.json());
app.use(cors());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("frontend/home");
});

app.post("/create", async (req, res) => {
  let { name, email, phone, message } = req.body;
  const createdContact = await contactModel.create({
    name,
    email,
    phone,
    message,
  });
  res.redirect("/");
});
app.get("/dashboard", (req, res) => {
  res.render("admin/dashboard");
});
app.get("/admin", (req, res) => {
  res.render("admin/auth/login");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User does not exist");
      return res.redirect("/login");
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/admin");
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token
    jwt.sign(payload, "secret", { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.error("JWT signing error:", err);
        req.flash("error", "Server error");
        return res.redirect("/login");
      }

      req.flash("success", "Login successful");
      res.redirect("/dashboard");
    });
  } catch (err) {
    console.error("Server error:", err);
    req.flash("error", "Server error");
    res.redirect("/login");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session during logout:", err);
      req.flash("error", "Failed to logout");
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    req.flash("success", "Logged out successfully");
    res.redirect("/admin");
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

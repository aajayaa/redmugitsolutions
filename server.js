require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const partials = require("express-partials");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const port = 3000;
const path = require("path");
const contactModel = require("./models/contact.model");
const User = require("./models/user.model");
const Team = require("./models/teams.model");
const Client = require("./models/clients.model");
const db = require("./connection");
const Testimonial = require("./models/testimonials.model");
const Project = require("./models/projects.model");

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
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload
const upload = multer({ storage: storage });
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
// }).array("pictures", 10); // Maximum 10 files

// Check file type
// function checkFileType(file, cb) {
//   // Allowed extensions
//   const filetypes = /jpeg|jpg|png|gif/;
//   // Check extension
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime type
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb("Error: Images Only!");
//   }
// }

app.get("/", async (req, res) => {
  let teams = await Team.find();
  let clients = await Client.find();
  let testimonials = await Testimonial.find();
  let projects = await Project.find();
  res.render("frontend/home", { teams, clients, testimonials, projects });
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
app.get("/teams", async (req, res) => {
  let teams = await Team.find();
  res.render("admin/managedTeams", { teams });
});
app.get("/add-teams", (req, res) => {
  res.render("admin/teams");
});
app.post("/teams/add", upload.single("file"), async (req, res) => {
  // Create new form document
  const newTeam = new Team({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    fbLink: req.body.fb_link,
    instaLink: req.body.insta_link,
    xLink: req.body.x_link,
    linkedinLink: req.body.linkedin,
    pictures: req.file.filename,
  });

  // Save document
  await newTeam.save();
  res.redirect("/teams");
});
app.get("/add-clients", (req, res) => {
  res.render("admin/add-clients");
});
app.get("/clients", async (req, res) => {
  let clients = await Client.find();
  res.render("admin/clients", { clients });
});

app.post("/clients/add", upload.single("logo"), async (req, res) => {
  // Create new form document
  const client = new Client({
    name: req.body.name,
    logo: req.file.filename,
  });

  // Save document
  await client.save();
  res.redirect("/clients");
});
app.get("/projects/add", (req, res) => {
  res.render("admin/addProject");
});
app.get("/contacts", async (req, res) => {
  let contacts = await contactModel.find();
  res.render("admin/contacts", { contacts });
});
app.get("/admin", (req, res) => {
  res.render("admin/auth/login");
});
app.get("/testimonials", (req, res) => {
  res.render("admin/testimonials");
});
app.get("/add-testimonials", (req, res) => {
  res.render("admin/add-testimonials");
});
app.post("/testimonials/add", upload.single("picture"), async (req, res) => {
  // Create new form document
  const testimonial = new Testimonial({
    name: req.body.name,
    review: req.body.review,
    logo: req.file.filename,
  });
  // Save document
  await testimonial.save();
  res.redirect("/testimonials");
});
app.get("/projects", async (req, res) => {
  let projects = await Project.find();
  res.render("admin/projects", { projects });
});
app.get("/add-projects", (req, res) => {
  res.render("admin/add-projects");
});
app.post("/projects/add", upload.single("picture"), async (req, res) => {
  // Create new form document
  const project = new Project({
    name: req.body.name,
    description: req.body.description,
    picture: req.file.filename,
  });
  // Save document
  await project.save();
  res.redirect("/projects");
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

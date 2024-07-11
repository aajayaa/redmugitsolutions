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
const cookieParser = require("cookie-parser");
const path = require("path");
const contactModel = require("./models/contact.model");
const User = require("./models/user.model");
const Team = require("./models/teams.model");
const Client = require("./models/clients.model");
const db = require("./connection");
const Testimonial = require("./models/testimonials.model");
const Project = require("./models/projects.model");
// const settingsRoute = require("./routes/settings");

const port = 3000;

app.use(cookieParser());
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

app.get("/admin", (req, res) => {
  res.render("admin/auth/login");
});

// Seed data
async function seedUser() {
  const user = await User.findOne({ email: "admin@redmugitsolutions.com" });
  if (!user) {
    const hashedPassword = await bcrypt.hash("password", 10);
    await User.create({
      name: "Admin",
      email: "admin@redmugitsolutions.com",
      password: hashedPassword,
    });
  }
}
seedUser();

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
    expiresIn: "1h",
  });
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/dashboard");
  // res.json({ message: "Logged in successfully" });
});

// Logout route
// Logout route
app.get("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  // res.json({ message: "Logged out successfully" });
  res.redirect("/admin");
});

// Middleware to check authentication
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    // return res.sendStatus(401);
    return res.redirect("/admin");
  }

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) {
      // return res.sendStatus(403);
      return res.redirect("/admin");
    }
    req.user = user;
    next();
  });
}

// app.use("/update-settings", settingsRoute);
app.post("/update-settings", upload.single("photo"), async (req, res) => {
  let user = await User.findOne({ email: req.user.email });
  // user.photo = req.file.filename;
  // user.save();
  console.log(user);
  res.redirect("/settings", { user });
});

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

app.get("/dashboard", authMiddleware, (req, res) => {
  res.render("admin/dashboard");
});

app.get("/teams", authMiddleware, async (req, res) => {
  let teams = await Team.find();
  res.render("admin/managedTeams", { teams });
});

app.get("/add-teams", authMiddleware, (req, res) => {
  res.render("admin/teams");
});

app.post(
  "/teams/add",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
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

    await newTeam.save();
    res.redirect("/teams");
  }
);

app.get("/add-clients", authMiddleware, (req, res) => {
  res.render("admin/add-clients");
});

app.get("/clients", authMiddleware, async (req, res) => {
  let clients = await Client.find();
  res.render("admin/clients", { clients });
});

app.post(
  "/clients/add",
  authMiddleware,
  upload.single("logo"),
  async (req, res) => {
    const client = new Client({
      name: req.body.name,
      logo: req.file.filename,
    });

    await client.save();
    res.redirect("/clients");
  }
);

app.get("/projects/add", authMiddleware, (req, res) => {
  res.render("admin/addProject");
});

app.get("/contacts", authMiddleware, async (req, res) => {
  let contacts = await contactModel.find();
  res.render("admin/contacts", { contacts });
});

app.get("/testimonials", authMiddleware, async (req, res) => {
  let testimonials = await Testimonial.find();
  res.render("admin/testimonials", { testimonials });
});

app.get("/add-testimonials", authMiddleware, (req, res) => {
  res.render("admin/add-testimonials");
});

app.post(
  "/testimonials/add",
  authMiddleware,
  upload.single("picture"),
  async (req, res) => {
    const testimonial = new Testimonial({
      name: req.body.name,
      review: req.body.review,
      logo: req.file.filename,
    });

    await testimonial.save();
    res.redirect("/testimonials");
  }
);

app.get("/projects", authMiddleware, async (req, res) => {
  let projects = await Project.find();
  res.render("admin/projects", { projects });
});

app.get("/add-projects", authMiddleware, (req, res) => {
  res.render("admin/add-projects");
});

app.post(
  "/projects/add",
  authMiddleware,
  upload.single("picture"),
  async (req, res) => {
    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      picture: req.file.filename,
    });

    await project.save();
    res.redirect("/projects");
  }
);
app.get("/settings", (req, res) => {
  res.render("admin/settings");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

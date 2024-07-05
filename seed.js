// seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user.model");
const db = require("./connection");

const seedUsers = [
  {
    name: "Admin",
    email: "admin@redmugitsolutions.com",
    password: "password",
  },
  //   {
  //     name: 'Jane Doe',
  //     email: 'jane@example.com',
  //     password: 'password123'
  //   }
];

const hashPasswords = async (users) => {
  for (let user of users) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
};

const seedDB = async () => {
  await User.deleteMany({});
  await hashPasswords(seedUsers);
  await User.insertMany(seedUsers);
  console.log("Database seeded!");
  mongoose.connection.close();
};

seedDB().catch((err) => console.log(err));

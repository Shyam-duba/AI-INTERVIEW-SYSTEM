const express = require("express");
const { addUser, findUserByUsername } = require("../controllers/userController");
const { generateToken } = require("../config/jwtValidation");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.post("/register", async (req, res) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const existingUser = await findUserByUsername(name);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = await addUser(name, email, password);
  // const token = generateToken(newUser);

  console.log(newUser);

  res.status(201).json({ message: "User registered", user: newUser });
});

router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  const user = await findUserByUsername(name);

  console.log(user);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  const token = generateToken(user);
  res.status(200).json({ message: "Logged in successfully", token, id: user.id });
});

module.exports = router;

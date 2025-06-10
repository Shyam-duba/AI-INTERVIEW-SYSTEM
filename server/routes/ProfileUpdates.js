// routes/ProfileUpdates.js
const express = require("express");
const { updateUserDetails } = require("../controllers/userController");
const { authMiddleware } = require("../middlewaare/AuthMiddleware");

const router = express.Router();

router.put("/update-profile", authMiddleware, async (req, res) => {
  const { name, email, old_name } = req.body;
  try {
    const updatedUser = await updateUserDetails(name, email, old_name);
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

module.exports = router;

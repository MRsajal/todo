const express = require("express");
const router = express.Router();
const User = require("./User");
const multer = require("multer");
const path = require("path");
const auth = require("./middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
// Get user profile
router.get("/", auth, async (req, res) => {
  try {
    // req.userId comes from the auth middleware
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user profile
router.put("/", auth, upload.single("profileImage"), async (req, res) => {
  try {
    const { username, email } = req.body;

    // Find the user
    let user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username is being changed and if it's available
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    // Check if email is being changed and if it's available
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update profile image if a new one is uploaded
    if (req.file) {
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Save the updated user
    await user.save();

    // Return updated user data without password
    const updatedUser = await User.findById(req.userId).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add points to user
router.put("/points", auth, async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || isNaN(points)) {
      return res.status(400).json({ message: "Valid points value required" });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { points: parseInt(points) } }, // Increment points
      { new: true } // Return updated document
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `${points > 0 ? "Added" : "Deducted"} ${Math.abs(
        points
      )} points successfully`,
      currentPoints: user.points,
    });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user achievements based on points
router.get("/achievements", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("points");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Define achievements based on points
    const achievements = [
      {
        id: "first_100",
        name: "First 100 Points",
        description: "Earned your first 100 points",
        icon: "checkmark-circle",
        unlocked: user.points >= 100,
      },
      {
        id: "power_user",
        name: "Power User",
        description: "Reached 500 points",
        icon: "flash",
        unlocked: user.points >= 500,
      },
      {
        id: "expert",
        name: "Expert Status",
        description: "Achieved 1,000 points",
        icon: "star",
        unlocked: user.points >= 1000,
      },
      {
        id: "master",
        name: "Master",
        description: "Reached the prestigious 5,000 point mark",
        icon: "settings",
        unlocked: user.points >= 5000,
      },
    ];

    res.status(200).json({
      points: user.points,
      achievements: achievements,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

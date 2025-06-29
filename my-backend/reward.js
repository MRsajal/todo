const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("./User");

const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    default: 0,
  },
  achieved: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Reward = mongoose.model("Reward", rewardSchema);

router.get("/", async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/active", async (req, res) => {
  try {
    const rewards = await Reward.find({ completed: false });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newReward = new Reward({
      title: req.body.title,
      cost: req.body.cost !== undefined ? req.body.cost : 0,
      achieved: req.body.achieved !== undefined ? req.body.achieved : false,
      userId: req.body.userId,
    });
    const savedReward = await newReward.save();
    res.json(savedReward);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const deletedTask = await Reward.findByIdAndDelete({ _id: id, userId });
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Reward deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { achieved, userId } = req.body;
    const reward = await Reward.findById(id);
    if (!reward) {
      return res.status(404).json({ message: "reward not found" });
    }

    if (achieved && !reward.achieved) {
      // User is marking reward as achieved (we deduct points)
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.points < reward.cost) {
        return res
          .status(400)
          .json({ message: "Not enough points to claim this reward" });
      }

      user.points -= reward.cost;
      await user.save();

      reward.achieved = achieved;
      await reward.save();

      return res.json({
        ...reward.toObject(),
        userPoints: user.points,
      });
    } else if (!achieved && reward.achieved) {
      // User is unmarking achieved reward (we refund points)
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.points += reward.cost;
      await user.save();

      reward.achieved = achieved;
      await reward.save();

      return res.json({
        ...reward.toObject(),
        userPoints: user.points,
      });
    } else {
      // Just a normal update, no achievement toggle
      const updatedReward = await Reward.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.json(updatedReward);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("./User");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
  isDailyReward: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String,
  },
});

const Reward = mongoose.model("Reward", rewardSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function tryGenerateContent(model, prompt, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      console.warn(`Retry ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err; // bubble up after final failure
      }
    }
  }
}

// Timeout wrapper
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
    ),
  ]);
}

// Fallback reward list
const fallbackRewards = [
  "Watch a movie",
  "Take a nap",
  "Go for a walk",
  "Buy yourself a treat",
  "Read a comic",
  "Do 5 minutes of breathing",
  "Drink your favorite tea",
  "Draw something silly",
  "Text a friend",
  "Dance to one song",
];

router.get("/daily-reward/:userId", async (req, res) => {
  const userId = req.params.userId;
  const today = new Date().toISOString().split("T")[0];

  try {
    console.log("Generating daily reward for user:", userId);

    const existing = await Reward.findOne({
      userId,
      isDailyReward: true,
      date: today,
    });

    if (existing) {
      console.log("Daily reward already exists:", existing);
      return res.json(existing);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Generate one short, fun, creative daily reward idea someone could enjoy. 
      Keep it short and simple like "Watch a movie", "Buy a treat", "Take a nap".
    `;

    let title;
    try {
      const result = await withTimeout(
        tryGenerateContent(model, prompt),
        10000
      );
      const rawText = await result.response.text();
      title = rawText.trim().replace(/^"|"$/g, "");
      console.log("Gemini result:", title);
    } catch (genErr) {
      console.warn("⚠️ Gemini failed after retries. Using fallback.");
      title =
        fallbackRewards[Math.floor(Math.random() * fallbackRewards.length)];
    }

    const reward = new Reward({
      title,
      cost: 100,
      achieved: false,
      userId,
      isDailyReward: true,
      date: today,
    });

    await reward.save();
    console.log("Reward saved:", reward);

    res.json(reward);
  } catch (error) {
    console.error("❌ Fatal error in /daily-reward route:");
    console.error(error.stack || error);
    res.status(500).json({
      message: "Failed to generate or save daily reward",
      error: error.message,
    });
  }
});

router.get("/:userId", async (req, res) => {
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

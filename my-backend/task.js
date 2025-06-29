const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("./User");
const Task = require("./taskSchema");
const axios = require("axios");
require("dotenv").config();

let lastSundayCleanupDate = null;
let lastDailyCleanupDate = null;
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/", async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayDateStr = today.toISOString().split("T")[0];

    if (dayOfWeek === 0 && lastSundayCleanupDate !== todayDateStr) {
      await Task.deleteMany({ frequency: "weekly" });
      lastSundayCleanupDate = todayDateStr;
    }

    if (lastDailyCleanupDate !== todayDateStr) {
      await Task.deleteMany({
        frequency: "daily",
        dayNumber: { $ne: dayOfWeek },
      });
      lastDailyCleanupDate = todayDateStr;
    }
    const tasks = await Task.find({ dayNumber: dayOfWeek });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      generate = false,
      title,
      points,
      completed = false,
      text = "Positive",
      userId,
      dayNumber = new Date().getDay(),
      frequency,
      category,
      amount,
      level,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (!["daily", "weekly"].includes(frequency)) {
      return res
        .status(400)
        .json({ message: "Invalid frequency (must be daily or weekly)" });
    }

    // === 🔹 Handle Gemini Task Generation ===
    if (generate) {
      if (!category || !amount || !level || !text) {
        return res.status(400).json({ message: "Missing generation fields" });
      }

      const prompt = `
        Generate ${amount} ${frequency} tasks with a ${text.toLowerCase()} focus.
        These should be in the category "${category}" and suitable for ${level} difficulty level.
        Respond with a plain list of task titles only, no numbering or extra descriptions.
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textOutput = response.text();

      const taskTitles = textOutput
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);

      const levelPoints = {
        easy: 10,
        medium: 15,
        hard: 20,
      };

      const generatedTasks = await Promise.all(
        taskTitles.map(async (taskTitle) => {
          const newTask = new Task({
            title: taskTitle,
            points: levelPoints[level.toLowerCase()] || 10,
            completed: false,
            text,
            userId: new mongoose.Types.ObjectId(userId),
            dayNumber,
            frequency,
          });
          return await newTask.save();
        })
      );

      return res.json(generatedTasks);
    }

    // === 🔹 Manual Task Addition ===
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ message: "Title is required and must be a string" });
    }

    const newTask = new Task({
      title,
      points: Number(points),
      completed,
      text,
      userId: new mongoose.Types.ObjectId(userId),
      dayNumber,
      frequency,
    });

    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const deletedTask = await Task.findByIdAndDelete({ _id: id, userId });
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" }); // ✅ Response sent

    // Fire-and-forget
    axios
      .post("http://localhost:5000/api/taskstats/sync", {
        userId,
      })
      .catch((err) => console.error("Error syncing task stats:", err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, userId } = req.body;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    axios
      .post("http://localhost:5000/api/taskstats/update", {
        userId,
        taskId: id,
        completed,
        frequency: task.frequency,
      })
      .catch((err) => console.error("Error updating task stats:", err));

    if (completed && !task.completed) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (task.frequency === "Positive") {
        user.points += task.points;
      } else if (task.frequency === "Negative") {
        user.points -= task.points;
      }

      await user.save();

      task.completed = completed;
      await task.save();
      return res.json({
        ...task.toObject(),
        userPoints: user.points,
      });
    } else if (!completed && task.completed) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (task.frequency === "Positive") {
        user.points = Math.max(0, user.points - task.points);
      } else if (task.frequency === "Negative") {
        user.points += task.points;
      }
      await user.save();
      task.completed = completed;
      await task.save();
      return res.json({ ...task.toObject(), userPoints: user.points });
    } else {
      const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.json(updatedTask);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

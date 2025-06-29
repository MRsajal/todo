const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Task = require("./taskSchema");
const TaskStats = require("./taskStatus");

// Get overall task statistics
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get today's date info
    const today = new Date();
    const dayNumber = today.getDay();
    const weekNumber = getWeekNumber(today);

    // Get current task counts
    const totalTasks = await Task.find({ userId }).countDocuments();
    const completedTasks = await Task.find({
      userId,
      completed: true,
    }).countDocuments();
    const dailyTasks = await Task.find({
      userId,
      frequency: "daily",
    }).countDocuments();
    const weeklyTasks = await Task.find({
      userId,
      frequency: "weekly",
    }).countDocuments();

    // Get today's stats from TaskStats collection
    const taskStats = await TaskStats.findOne({
      userId,
      dayNumber,
      weekNumber,
    });

    // Calculate completion percentage
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Prepare response with both overall stats and day-specific stats
    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      dailyTasks,
      weeklyTasks,
      completionRate,
      // Include the task stats if available
      today: taskStats
        ? {
            dayNumber: taskStats.dayNumber,
            dailyTasksTotal: taskStats.dailyTasksTotal,
            dailyTasksCompleted: taskStats.dailyTasksCompleted,
            weeklyTasksTotal: taskStats.weeklyTasksTotal,
            weeklyTasksCompleted: taskStats.weeklyTasksCompleted,
          }
        : null,
      week: taskStats
        ? {
            dailyTasksTotal: taskStats.dailyTasksTotal,
            dailyTasksCompleted: taskStats.dailyTasksCompleted,
            weeklyTasksTotal: taskStats.weeklyTasksTotal,
            weeklyTasksCompleted: taskStats.weeklyTasksCompleted,
          }
        : null,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res
      .status(500)
      .json({ message: "Error fetching task stats", error: error.message });
  }
});

// Sync task statistics for a user
router.post("/sync", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const today = new Date();
    const dayNumber = today.getDay();
    const weekNumber = getWeekNumber(today);

    // Get current task counts
    const totalTasks = await Task.find({
      userId,
      text: "Positive",
    }).countDocuments();
    const completedTasks = await Task.find({
      userId,
      text: "Positive",
      completed: true,
    }).countDocuments();
    const dailyTasks = await Task.find({
      userId,
      text: "Positive",
      frequency: "daily",
    }).countDocuments();
    const weeklyTasks = await Task.find({
      userId,
      text: "Positive",
      frequency: "weekly",
    }).countDocuments();

    // Get current completion counts
    const dailyTasksCompleted = await Task.find({
      userId,
      frequency: "daily",
      text: "Positive",
      completed: true,
    }).countDocuments();

    const weeklyTasksCompleted = await Task.find({
      userId,
      frequency: "weekly",
      text: "Positive",
      completed: true,
    }).countDocuments();
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Check if stats document already exists for this user
    let taskStats = await TaskStats.findOne({ userId, dayNumber, weekNumber });

    const isNewDay =
      taskStats && !isSameDay(new Date(taskStats.lastUpdated), today);

    const isNewWeek =
      taskStats && getWeekNumber(new Date(taskStats.lastUpdated)) < weekNumber;

    // Calculate completion rate

    if (taskStats) {
      if (isNewDay) {
        taskStats.dayNumber = dayNumber;
        taskStats.dailyTasksTotal = 0;
        taskStats.dailyTasksCompleted = 0;
      }
      if (dayNumber === 0 && isNewWeek) {
        taskStats.weeklyTasksTotal = 0;
        taskStats.weeklyTasksCompleted = 0;
      }
      // Update existing stats - make sure to update both daily AND weekly completion
      taskStats.dailyTasksTotal = dailyTasks;
      taskStats.dailyTasksCompleted = dailyTasksCompleted;
      taskStats.weeklyTasksTotal = weeklyTasks;
      taskStats.weeklyTasksCompleted = weeklyTasksCompleted;
      taskStats.lastUpdated = today;
      taskStats.weekNumber = weekNumber;

      await taskStats.save();
    } else {
      // Create new stats document
      taskStats = new TaskStats({
        userId,
        dayNumber,
        weekNumber,
        dailyTasksTotal: dailyTasks,
        dailyTasksCompleted: dailyTasksCompleted,
        weeklyTasksTotal: weeklyTasks,
        weeklyTasksCompleted: weeklyTasksCompleted,
        lastUpdated: new Date(),
      });

      await taskStats.save();
    }

    res.status(200).json({
      message: "Task stats synced successfully",
      stats: taskStats,
    });
  } catch (error) {
    console.error("Error syncing task stats:", error);
    res
      .status(500)
      .json({ message: "Error syncing task stats", error: error.message });
  }
});

// Helper function to get week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

module.exports = router;

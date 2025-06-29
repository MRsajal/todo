const mongoose = require("mongoose");

const taskStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  dailyTasksTotal: {
    type: Number,
    default: 0,
  },
  dailyTasksCompleted: {
    type: Number,
    default: 0,
  },
  weeklyTasksTotal: {
    type: Number,
    default: 0,
  },
  weeklyTasksCompleted: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now(),
  },
});

taskStatsSchema.index(
  { userId: 1, dayNumber: 1, weekNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("TaskStats", taskStatsSchema);

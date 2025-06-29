const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  points: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  text: { type: String, default: "Positive" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dayNumber: { type: Number, min: 0, max: 6, required: true },
  frequency: { type: String, enum: ["daily", "weekly"], required: true },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

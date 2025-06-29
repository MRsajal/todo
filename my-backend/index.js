const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const authRoutes = require("./auth");
const taskRoutes = require("./task");
const rewardRoutes = require("./reward");
const profileRoutes = require("./userProfile");
const taskStatsRoutes = require("./taskStatusRoute");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

app.use(
  "/uploads/profiles",
  express.static(path.join(__dirname, "uploads/profiles"))
);

app.use("/api/tasks", taskRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/taskstats", taskStatsRoutes);

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  Gift,
  Star,
  Plus,
  X,
  Check,
  Coins,
  TrendingUp,
  Calendar,
  Target,
  CheckCircle,
  BarChart3,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

function AddList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(10);
  const [text, setText] = useState("Positive");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  const userId = localStorage.getItem("userId");
  const [taskCategory, setTaskCategory] = useState("");
  const [taskAmount, setTaskAmount] = useState(1);
  const [taskLevel, setTaskLevel] = useState("easy");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((res) => setTasks(res.data));
  }, []);
  const addTask = () => {
    if (!title.trim()) {
      setError("Task title cannot be empty");
      return;
    }
    if (!userId) {
      console.error("User ID is missing");
      return;
    }
    // const today = new Date().getDay();
    if (taskLevel === "medium") {
      setPoints(15);
    } else if (taskLevel === "hard") {
      setPoints(20);
    }

    const today = new Date().getDay();

    axios
      .post("http://localhost:5000/api/tasks", {
        title,
        points: Number(points),
        completed: false,
        text,
        userId,
        dayNumber: today,
        frequency: selectedFrequency.toLowerCase(),
      })
      .then((res) => setTasks([...tasks, res.data]))
      .catch((err) => {
        console.error(err);
        setError("Failed to add task"); // Optionally show error to user
      });
    setTitle("");
    setPoints(10);
    setIsModalOpen(false);
    setIsAIOpen(false);
    setText("Positive");
  };
  const generateTasksFromGemini = async () => {
    if (!userId) {
      console.error("User ID is missing");
      return;
    }
    try {
      const today = new Date().getDay();

      const response = await axios.post("http://localhost:5000/api/tasks", {
        generate: true,
        frequency: selectedFrequency.toLowerCase(),
        text, // tone: Positive or Negative
        category: taskCategory,
        amount: taskAmount,
        level: taskLevel,
        userId,
        dayNumber: today,
      });

      // Response is an array of saved tasks
      setTasks((prev) => [...prev, ...response.data]);

      setIsModalOpen(false);
      setIsAIOpen(false);
      setTaskAmount(1);
      setTaskCategory("");
      setTaskLevel("easy");
    } catch (error) {
      console.error("Failed to generate tasks", error);
      setError("Failed to generate tasks");
    }
  };

  function handleLogout() {
    localStorage.removeItem("userId");
    navigate("/login");
  }

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setTitle("");
  };

  const openModalAI = () => {
    setIsAIOpen(true);
    setIsModalOpen(false);
  };
  const closeModalAI = () => {
    setIsAIOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading tasks.....
      </div>
    );
  }

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/home")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                    isActive("/home")
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Home</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/tasks")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                    isActive("/tasks")
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Tasks</span>
                  </div>
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Task Management Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Organize your daily and weekly tasks efficiently with our smart task
            management system
          </p>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-center mb-8">
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
            onClick={openModal}
          >
            <span className="text-xl">+</span>
            <span>Add New Task</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stats Dashboard */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <TaskStatsDashboard />
          </div>

          {/* Task Lists */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <ShowPositiveList />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <ShowNegativeList />
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Task
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  onClick={closeModal}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Task Title
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={taskLevel}
                    onChange={(e) => setTaskLevel(e.target.value)}
                  >
                    <option value="">Select level</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Task Type
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  >
                    <option value="">Select task type</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={selectedFrequency}
                    onChange={(e) => setSelectedFrequency(e.target.value)}
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={addTask}
                >
                  Add Task
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium"
                  onClick={openModalAI}
                >
                  Use AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {isAIOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Task Generator
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  onClick={closeModalAI}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={taskLevel}
                    onChange={(e) => setTaskLevel(e.target.value)}
                  >
                    <option value="">Select level</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Task Type
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  >
                    <option value="">Select task type</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={selectedFrequency}
                    onChange={(e) => setSelectedFrequency(e.target.value)}
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Task Category
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                    <option value="game">Game</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {taskCategory === "custom" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Custom Category
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Number of Tasks
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
                    value={taskAmount}
                    onChange={(e) => setTaskAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  onClick={closeModalAI}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={generateTasksFromGemini}
                  disabled={
                    !taskLevel ||
                    !text ||
                    !selectedFrequency ||
                    !taskCategory ||
                    (taskCategory === "custom" && !customCategory)
                  }
                >
                  Generate Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShowNegativeList() {
  const [tasks, setTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  const userId = localStorage.getItem("userId");
  const currentDayNumber = new Date().getDay();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    dailyTasks: 0,
    weeklyTasks: 0,
  });

  const syncTaskStats = async () => {
    if (userId) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/taskstats/sync",
          {
            userId,
          }
        );

        const stats = res.data.stats;
        if (!stats || typeof stats !== "object") {
          console.warn("Unexpected stats format", stats);
        } else {
          setStats(stats);
        }
      } catch (error) {
        console.error("Error syncing task stats:", error);
      }
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((res) => {
        setTasks(res.data);
        return syncTaskStats();
      })
      .catch((err) => console.log("Error fetching tasks:", err));

    if (userId) {
      axios
        .get(`http://localhost:5000/api/profile/${userId}`)
        .then((res) => {
          if (res.data && res.data.points !== undefined) {
            setUserPoints(res.data.points);
          } else {
            console.warn("Unexpected user data format:", res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
          setTimeout(() => {
            axios
              .get(`http://localhost:5000/api/profile/${userId}`)
              .then((res) => setUserPoints(res.data.points))
              .catch((secondErr) => console.error("Retry failed:", secondErr));
          }, 2000);
        });
    }
  }, [userId]);

  const deleteListItem = async (id, frequency) => {
    if (frequency === "weekly" && currentDayNumber !== 0) {
      alert("Weekly tasks can only be deleted automatically on Sunday.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        data: { userId },
      });

      setTasks(tasks.filter((task) => task._id !== id));
      await syncTaskStats();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const task = tasks.find((t) => t._id === id);
      if (!task) {
        console.error("Task not found:", id);
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          completed: !currentStatus,
          userId,
          frequency: task.frequency,
        }
      );

      if (response.data.userPoints !== undefined) {
        setUserPoints(response.data.userPoints);
      }

      setTasks(tasks.map((t) => (t._id === id ? response.data : t)));
      await syncTaskStats();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const filteredTasks = tasks
    .filter((task) => task.userId === userId)
    .filter((task) => task.frequency === selectedFrequency)
    .filter((task) => (showCompleted ? true : !task.completed))
    .filter((task) => task.text === "Negative");

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Negative Task Manager
        </h2>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Task Type Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Type:
            </span>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedFrequency === "daily"
                    ? "bg-red-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setSelectedFrequency("daily")}
              >
                Daily
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedFrequency === "weekly"
                    ? "bg-red-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setSelectedFrequency("weekly")}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Show Completed Toggle */}
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={() => setShowCompleted(!showCompleted)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Completed Tasks
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              task.completed ? "opacity-75" : ""
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={task.completed}
                      onChange={() => toggleComplete(task._id, task.completed)}
                    />
                    {task.completed && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg
                          className="w-3 h-3 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-gray-900 dark:text-gray-100 leading-tight ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </h3>
                  </div>
                </div>

                <button
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors duration-200"
                  onClick={() => deleteListItem(task._id, task.frequency)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.2599-1"
                      />
                    </svg>
                    {task.points} pts
                  </span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  {task.text}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 0-1 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {showCompleted ? "" : "active"} tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {showCompleted
              ? "You haven't completed any tasks yet."
              : "Create your first task to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}
function ShowPositiveList() {
  const [tasks, setTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  const userId = localStorage.getItem("userId");
  const currentDayNumber = new Date().getDay();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    dailyTasks: 0,
    weeklyTasks: 0,
  });

  const syncTaskStats = async () => {
    if (userId) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/taskstats/sync",
          {
            userId,
          }
        );

        const stats = res.data.stats;
        if (!stats || typeof stats !== "object") {
          console.warn("Unexprected stats format", stats);
        } else {
          setStats(stats);
        }
      } catch (error) {
        console.error("Error syncing task stats:", error);
      }
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((res) => {
        setTasks(res.data);
        return syncTaskStats();
      })
      .catch((err) => console.log("Error fetching tasks:", err));

    if (userId) {
      axios
        .get(`http://localhost:5000/api/profile/${userId}`)
        .then((res) => {
          if (res.data && res.data.points !== undefined) {
            setUserPoints(res.data.points);
          } else {
            console.warn("Unexpected user data format:", res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
          // Handle 500 error with a retry mechanism
          setTimeout(() => {
            console.log("Retrying user data fetch...");
            axios
              .get(`http://localhost:5000/api/profile/${userId}`)
              .then((res) => setUserPoints(res.data.points))
              .catch((secondErr) => console.error("Retry failed:", secondErr));
          }, 2000);
        });
    }
  }, [userId]);

  const deleteListItem = async (id, frequency, dayNumber) => {
    if (frequency === "weekly" && currentDayNumber !== 0) {
      alert("Weekly tasks can only be deleted automatically on Sunday.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        data: { userId },
      });

      setTasks(tasks.filter((task) => task._id !== id));
      await syncTaskStats();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      // Find the task from the tasks array
      const task = tasks.find((t) => t._id === id);
      if (!task) {
        console.error("Task not found:", id);
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          completed: !currentStatus,
          userId,
          frequency: task.frequency,
        }
      );

      // Update points if returned
      if (response.data.userPoints !== undefined) {
        setUserPoints(response.data.userPoints);
      }

      // Update tasks array
      setTasks(tasks.map((t) => (t._id === id ? response.data : t)));

      // Sync stats after successful update
      await syncTaskStats();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Apply filtering on frontend
  const filteredTasks = tasks
    .filter((task) => task.userId === userId)
    .filter((task) => task.frequency === selectedFrequency)
    .filter((task) => (showCompleted ? true : !task.completed))
    .filter((task) => task.text === "Positive");
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Task Manager
        </h2>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Task Type Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Type:
            </span>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedFrequency === "daily"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setSelectedFrequency("daily")}
              >
                Daily
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedFrequency === "weekly"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setSelectedFrequency("weekly")}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Show Completed Toggle */}
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={() => setShowCompleted(!showCompleted)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Completed Tasks
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              task.completed ? "opacity-75" : ""
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={task.completed}
                      onChange={() => toggleComplete(task._id, task.completed)}
                    />
                    {task.completed && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg
                          className="w-3 h-3 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-gray-900 dark:text-gray-100 leading-tight ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </h3>
                  </div>
                </div>

                <button
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors duration-200"
                  onClick={() => deleteListItem(task._id)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    {task.points} pts
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    task.text === "Positive"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  {task.text}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {showCompleted ? "" : "active"} tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {showCompleted
              ? "You haven't completed any tasks yet."
              : "Create your first task to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}

const TaskStatsDashboard = () => {
  const [stats, setStats] = useState({
    today: {
      dailyTasksTotal: 0,
      dailyTasksCompleted: 0,
      weeklyTasksTotal: 0,
      weeklyTasksCompleted: 0,
      dayNumber: 0,
    },
    week: {
      dailyTasksTotal: 0,
      dailyTasksCompleted: 0,
      weeklyTasksTotal: 0,
      weeklyTasksCompleted: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTaskHistory, setDailyTaskHistory] = useState([]);
  const [weeklyTaskHistory, setWeeklyTaskHistory] = useState([]);
  const userId = localStorage.getItem("userId");
  const [isLoading, setIsLoading] = useState(false);
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:5000/api/taskstats/${userId}`)
      .then((res) => {
        console.log("Raw API response:", res.data);
        if (res.data) {
          const dayNumber = new Date().getDay();
          const todayStats = {
            dailyTasksTotal:
              res.data.today?.dailyTasksTotal ||
              res.data.dailyTasks ||
              res.data.dailyTasksTotal ||
              0,
            dailyTasksCompleted:
              res.data.today?.dailyTasksCompleted ||
              res.data.completedTasks ||
              res.data.dailyTasksCompleted ||
              0,
            weeklyTasksTotal:
              res.data.today?.weeklyTasksTotal ||
              res.data.weeklyTasks ||
              res.data.weeklyTasksTotal ||
              0,
            weeklyTasksCompleted:
              res.data.today?.weeklyTasksCompleted ||
              res.data.weeklyTasksCompleted ||
              0,
            dayNumber:
              res.data.today?.dayNumber || res.data.dayNumber || dayNumber,
          };
          const weekStats = {
            dailyTasksTotal:
              res.data.week?.dailyTasksTotal ||
              res.data.dailyTasks ||
              res.data.dailyTasksTotal ||
              0,
            dailyTasksCompleted:
              res.data.week?.dailyTasksCompleted ||
              res.data.completedTasks ||
              res.data.dailyTasksCompleted ||
              0,
            weeklyTasksTotal:
              res.data.week?.weeklyTasksTotal ||
              res.data.weeklyTasks ||
              res.data.weeklyTasksTotal ||
              0,
            weeklyTasksCompleted:
              res.data.week?.weeklyTasksCompleted ||
              res.data.weeklyTasksCompleted ||
              0,
          };
          setStats({
            today: todayStats,
            week: weekStats,
          });
          console.log("Mapped stats:", {
            today: todayStats,
            week: weekStats,
          });
          const mockDailyData = generateMockWeekData(todayStats, dayNames);
          const mockWeeklyData = generateMockWeekData(
            weekStats,
            dayNames,
            true
          );

          setDailyTaskHistory(mockDailyData);
          setWeeklyTaskHistory(mockWeeklyData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching task stats:", err);
        setError("Failed to fetch task stats.");
        setLoading(false);
      });

    axios
      .get(`http://localhost:5000/api/taskstats/${userId}/week`)
      .then((res) => {
        console.log("Weekly history response:", res.data);

        const dailyData = res.data.map((day) => ({
          day: dayNames[day.dayNumber] || "Unknown",
          completed: day.dailyTasksCompleted || 0,
          total: day.dailyTasksTotal || 0,
          percentage:
            day.dailyTasksTotal > 0
              ? Math.round(
                  (day.dailyTasksCompleted / day.dailyTasksTotal) * 100
                )
              : 0,
        }));
        const weeklyData = res.data.map((day) => ({
          day: dayNames[day.dayNumber] || "Unknown",
          completed: day.weeklyTasksCompleted || 0,
          total: day.weeklyTasksTotal || 0,
          percentage:
            day.weeklyTasksTotal > 0
              ? Math.round(
                  (day.weeklyTasksCompleted / day.weeklyTasksTotal) * 100
                )
              : 0,
        }));
        setDailyTaskHistory(dailyData);
        setWeeklyTaskHistory(weeklyData);
      })
      .catch((err) => {
        console.error("Error fetching weekly task stats:", err);
        // Handle 404 error specifically
        if (err.response && err.response.status === 404) {
          // Create empty history since the endpoint doesn't exist
          const defaultData = dayNames.map((day, index) => ({
            day,
            completed: 0,
            total: 0,
            percentage: 0,
          }));
          setDailyTaskHistory(defaultData);
          setWeeklyTaskHistory(defaultData);
        }
      });
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/task-stats"); // your endpoint
      const data = await response.json();

      const transformData = (entries) => {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const dailyTaskHistory = entries.map((entry) => {
          const percentage =
            entry.dailyTasksTotal > 0
              ? (entry.dailyTasksCompleted / entry.dailyTasksTotal) * 100
              : 0;

          return {
            day: `Day ${entry.dayNumber}`,
            percentage: parseFloat(percentage.toFixed(2)),
          };
        });

        const weeklyTaskHistory = entries.map((entry) => {
          const percentage =
            entry.weeklyTasksTotal > 0
              ? (entry.weeklyTasksCompleted / entry.weeklyTasksTotal) * 100
              : 0;

          return {
            day: `Week ${entry.weekNumber}`,
            completed: entry.weeklyTasksCompleted,
            total: entry.weeklyTasksTotal,
            percentage: parseFloat(percentage.toFixed(2)),
          };
        });

        return { dailyTaskHistory, weeklyTaskHistory };
      };

      const { dailyTaskHistory, weeklyTaskHistory } = transformData(data);
      setDailyTaskHistory(dailyTaskHistory);
      setWeeklyTaskHistory(weeklyTaskHistory);
    };

    fetchData();
  }, []);

  const generateMockWeekData = (data, dayNames, isWeekly = false) => {
    const currentDayNumber = data.dayNumber;

    return dayNames.map((day, index) => {
      if (index === currentDayNumber) {
        // This is today - use actual data
        return {
          day,
          completed: isWeekly
            ? data.weeklyTasksCompleted
            : data.dailyTasksCompleted,
          total: isWeekly ? data.weeklyTasksTotal : data.dailyTasksTotal,
          percentage: isWeekly
            ? data.weeklyTasksTotal > 0
              ? Math.round(
                  (data.weeklyTasksCompleted / data.weeklyTasksTotal) * 100
                )
              : 0
            : data.dailyTasksTotal > 0
            ? Math.round(
                (data.dailyTasksCompleted / data.dailyTasksTotal) * 100
              )
            : 0,
        };
      } else if (index < currentDayNumber) {
        // Past days - create plausible mock data
        const total = isWeekly
          ? data.weeklyTasksTotal
          : Math.floor(Math.random() * 5) + 1;
        const completed = isWeekly
          ? Math.floor(
              Math.random() *
                (data.weeklyTasksCompleted > 0 ? data.weeklyTasksCompleted : 1)
            )
          : Math.floor(Math.random() * total);

        return {
          day,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      } else {
        // Future days - return empty or zero data
        return {
          day,
          completed: 0,
          total: isWeekly ? data.weeklyTasksTotal : 0,
          percentage: 0,
        };
      }
    });
  };

  const calculatePercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // const renderProgressBar = (completed, total) => {
  //   const percentage = calculatePercentage(completed, total);

  //   return (
  //     <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
  //       <div
  //         className="bg-blue-600 h-2.5 rounded-full"
  //         style={{ width: `${percentage}%` }}
  //       ></div>
  //     </div>
  //   );
  // };
  const handleSync = () => {
    axios
      .post("http://localhost:5000/api/taskstats/sync", { userId })
      .then((response) => {
        console.log("Sync response:", response.data);
        // Refresh data instead of full page reload
        if (!userId) {
          setLoading(false);
          return;
        }

        axios
          .get(`http://localhost:5000/api/taskstats/${userId}`)
          .then((res) => {
            console.log("Refresh data after sync:", res.data);
            if (res.data) {
              const dayNumber = new Date().getDay();
              const todayStats = {
                dailyTasksTotal:
                  res.data.today?.dailyTasksTotal ||
                  res.data.dailyTasks ||
                  res.data.dailyTasksTotal ||
                  0,
                dailyTasksCompleted:
                  res.data.today?.dailyTasksCompleted ||
                  res.data.completedTasks ||
                  res.data.dailyTasksCompleted ||
                  0,
                weeklyTasksTotal:
                  res.data.today?.weeklyTasksTotal ||
                  res.data.weeklyTasks ||
                  res.data.weeklyTasksTotal ||
                  0,
                weeklyTasksCompleted:
                  res.data.today?.weeklyTasksCompleted ||
                  res.data.weeklyTasksCompleted ||
                  0,
                dayNumber:
                  res.data.today?.dayNumber || res.data.dayNumber || dayNumber,
              };

              const weekStats = {
                dailyTasksTotal:
                  res.data.week?.dailyTasksTotal ||
                  res.data.dailyTasks ||
                  res.data.dailyTasksTotal ||
                  0,
                dailyTasksCompleted:
                  res.data.week?.dailyTasksCompleted ||
                  res.data.completedTasks ||
                  res.data.dailyTasksCompleted ||
                  0,
                weeklyTasksTotal:
                  res.data.week?.weeklyTasksTotal ||
                  res.data.weeklyTasks ||
                  res.data.weeklyTasksTotal ||
                  0,
                weeklyTasksCompleted:
                  res.data.week?.weeklyTasksCompleted ||
                  res.data.weeklyTasksCompleted ||
                  0,
              };

              setStats({
                today: todayStats,
                week: weekStats,
              });
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error refreshing task stats:", err);
            setLoading(false);
          });
      })
      .catch((err) => console.error("Sync error:", err));
  };

  const currentDay =
    typeof stats.today.dayNumber === "number"
      ? dayNames[stats.today.dayNumber]
      : "Today";

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderProgressBar = (completed, total) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const getColor = (perc) => {
      if (perc >= 90) return "bg-emerald-500";
      if (perc >= 70) return "bg-blue-500";
      if (perc >= 50) return "bg-yellow-500";
      return "bg-red-500";
    };

    return (
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getColor(
              percentage
            )} shadow-sm`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 drop-shadow-sm">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, completed, total, icon: Icon, gradient }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
      <div
        className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      >
        <div className="absolute top-0 right-0 opacity-10">
          <Icon size={80} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/90 text-sm font-medium uppercase tracking-wide">
              {title}
            </h3>
            <Icon className="text-white/80" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{completed}</span>
              <span className="text-white/70 text-lg">/ {total}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-right">
              <span className="text-white/90 text-sm font-medium">
                {Math.round(percentage)}% Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Task Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your productivity and stay on top of your goals
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <Zap size={18} />
              )}
              {isLoading ? "Syncing..." : "Sync Stats"}
            </button>
          </div>
        </div>

        {/* Today's Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Daily Tasks"
            completed={stats.today.dailyTasksCompleted}
            total={stats.today.dailyTasksTotal}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Weekly Tasks"
            completed={stats.today.weeklyTasksCompleted}
            total={stats.today.weeklyTasksTotal}
            icon={Calendar}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Week Total (Daily)"
            completed={stats.week.dailyTasksCompleted}
            total={stats.week.dailyTasksTotal}
            icon={Target}
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <StatCard
            title="Weekly Progress"
            completed={stats.week.weeklyTasksCompleted}
            total={stats.week.weeklyTasksTotal}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-orange-500 to-red-600"
          />
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Today's Progress
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentDay}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Daily Tasks
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {stats.today.dailyTasksCompleted} /{" "}
                    {stats.today.dailyTasksTotal}
                  </span>
                </div>
                {renderProgressBar(
                  stats.today.dailyTasksCompleted,
                  stats.today.dailyTasksTotal
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Weekly Tasks
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {stats.today.weeklyTasksCompleted} /{" "}
                    {stats.today.weeklyTasksTotal}
                  </span>
                </div>
                {renderProgressBar(
                  stats.today.weeklyTasksCompleted,
                  stats.today.weeklyTasksTotal
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3
                  className="text-purple-600 dark:text-purple-400"
                  size={20}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Weekly Summary
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Overall progress
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Daily Tasks (Week Total)
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {stats.week.dailyTasksCompleted} /{" "}
                    {stats.week.dailyTasksTotal}
                  </span>
                </div>
                {renderProgressBar(
                  stats.week.dailyTasksCompleted,
                  stats.week.dailyTasksTotal
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Weekly Tasks Progress
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {stats.week.weeklyTasksCompleted} /{" "}
                    {stats.week.weeklyTasksTotal}
                  </span>
                </div>
                {renderProgressBar(
                  stats.week.weeklyTasksCompleted,
                  stats.week.weeklyTasksTotal
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Daily Tasks Completion
            </h2>

            {dailyTaskHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={dailyTaskHistory}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorPercentage"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorPercentage)"
                    strokeWidth={3}
                    name="Completion Rate (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <BarChart3 size={48} className="mb-4 opacity-50" />
                <p>No daily task data available for this week yet</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Weekly Tasks Progression
            </h2>

            {weeklyTaskHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={weeklyTaskHistory}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 6 }}
                    name="Tasks Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ fill: "#6b7280", r: 4 }}
                    name="Total Tasks"
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 4 }}
                    name="Completion %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <TrendingUp size={48} className="mb-4 opacity-50" />
                <p>No weekly task data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddList;

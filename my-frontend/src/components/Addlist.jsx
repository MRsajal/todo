import React, { useEffect, useState } from "react";
import axios from "axios";
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
    <div>
      <nav className="flex justify-between items-center mb-6 py-3 px-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/home")}
            className={`px-4 py-2 rounded ${
              isActive("/home")
                ? "bg-blue-600 text-white hover:bg-blue-600"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/tasks")}
            className={`px-4 py-2 rounded ${
              isActive("/tasks")
                ? "bg-blue-600 text-white hover:bg-blue-600"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Tasks
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Logout
        </button>
      </nav>
      <div className="max-w-4xl mx-auto px-4 flex justify-center items-center mb-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Welcome to AddList Page
        </h1>
      </div>
      <div className="mb-6 max-w-4xl mx-auto px-4 flex justify-center items-center">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex justify-center items-center"
          onClick={openModal}
        >
          <span className="mr-1 font-bold text-lg">+</span> Add New Task
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <TaskStatsDashboard />
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <ShowPositiveList />
          <ShowNegativeList />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Task
              </h2>
              <button
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="task-title"
              >
                Task Title
              </label>
              <input
                id="task-title"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="task-level"
              >
                Difficulty Level
              </label>
              <select
                id="task-level"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={taskLevel}
                onChange={(e) => setTaskLevel(e.target.value)}
              >
                <option value="">Select level</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="task-text"
              >
                Task Type
              </label>
              <select
                id="task-text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={text} // make sure you're using `text` state to store the selection
                onChange={(e) => setText(e.target.value)}
              >
                <option value="">Select task type</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="task-date"
              >
                Daily or Weekly
              </label>
              <select
                id="task-date"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={selectedFrequency} // make sure you're using `text` state to store the selection
                onChange={(e) => setSelectedFrequency(e.target.value)}
              >
                <option value="">Select task type</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-2 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={addTask}
              >
                Add Custom Task
              </button>
              <button
                className="px-2 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={openModalAI}
              >
                Use AI
              </button>
            </div>
          </div>
        </div>
      )}
      {isAIOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Generate Tasks with AI
              </h2>
              <button
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                onClick={closeModalAI}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="ai-task-level"
              >
                Difficulty Level
              </label>
              <select
                id="ai-task-level"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={taskLevel}
                onChange={(e) => setTaskLevel(e.target.value)}
              >
                <option value="">Select level</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="ai-task-text"
              >
                Task Type
              </label>
              <select
                id="ai-task-text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={text}
                onChange={(e) => setText(e.target.value)}
              >
                <option value="">Select task type</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="ai-task-date"
              >
                Daily or Weekly
              </label>
              <select
                id="ai-task-date"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
              >
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="task-category"
              >
                Task Category
              </label>
              <select
                id="task-category"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="ai-custom-category"
                >
                  Custom Category
                </label>
                <input
                  id="ai-custom-category"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                htmlFor="task-amount"
              >
                Number of Tasks to Generate
              </label>
              <input
                id="task-amount"
                type="number"
                min="1"
                value={taskAmount}
                onChange={(e) => setTaskAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={closeModalAI}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={generateTasksFromGemini}
                disabled={
                  !taskLevel ||
                  !text ||
                  !selectedFrequency ||
                  !taskCategory ||
                  (taskCategory === "custom" && !customCategory)
                }
              >
                Generate AI Tasks
              </button>
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
    <div className="container mx-auto p-4">
      <div className="flex items-center">
        <label>Task Type:</label>
        <button
          className={`px-4 py-1 rounded ${
            selectedFrequency === "daily"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
          }`}
          onClick={() => setSelectedFrequency("daily")}
        >
          Daily
        </button>
        <button
          className={`px-4 py-1 rounded ${
            selectedFrequency === "weekly"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
          }`}
          onClick={() => setSelectedFrequency("weekly")}
        >
          Weekly
        </button>
        <label className="flex items-center px-4">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
            className="mr-2"
          />
          <span>Show Completed tasks</span>
        </label>
      </div>
      <div className="grid grid-cols-1 pt-10 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="w-4/5">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4"
                      checked={task.completed}
                      onChange={() => toggleComplete(task._id, task.completed)}
                    />
                    <p
                      className="font-medium text-gray-800 dark:text-gray-100 truncate"
                      title={task.title}
                    >
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">
                      {task.points} points
                    </span>
                    <span className="ml-5 text-red-400">{task.text}</span>
                  </div>
                </div>

                <button
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded"
                  onClick={() => deleteListItem(task._id, task.frequency)}
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredTasks.length === 0 && (
        <div className="text-center p-4 text-gray-500">
          No {showCompleted ? "" : "active"} tasks found
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
    <div className="container mx-auto p-4">
      <div className="flex items-center">
        <label>Task Type:</label>
        <button
          className={`px-4 py-1 rounded ${
            selectedFrequency === "daily"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
          }`}
          onClick={() => setSelectedFrequency("daily")}
        >
          Daily
        </button>
        <button
          className={`px-4 py-1 rounded ${
            selectedFrequency === "weekly"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
          }`}
          onClick={() => setSelectedFrequency("weekly")}
        >
          Weekly
        </button>
        <label className="flex items-center px-4">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
            className="mr-2"
          />
          <span>Show Completed tasks</span>
        </label>
      </div>
      <div className="grid grid-cols-1 pt-10 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="w-4/5">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4"
                      checked={task.completed}
                      onChange={() => toggleComplete(task._id, task.completed)}
                    />
                    <p
                      className="font-medium text-gray-800 dark:text-gray-100 truncate"
                      title={task.title}
                    >
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">
                      {task.points} points
                    </span>
                    <span className="ml-5 text-green-400">{task.text}</span>
                  </div>
                </div>

                <button
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded"
                  onClick={() => deleteListItem(task._id)}
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredTasks.length === 0 && (
        <div className="text-center p-4 text-gray-500">
          No {showCompleted ? "" : "active"} tasks found
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

  const renderProgressBar = (completed, total) => {
    const percentage = calculatePercentage(completed, total);

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Task Statistics Dashboard
      </h1>

      <button
        onClick={handleSync}
        className="bg-blue-500 text-white px-4 py-2 mb-6 rounded hover:bg-blue-600"
      >
        Sync Stats
      </button>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Today's Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Today's Progress ({currentDay})
          </h2>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Daily Tasks
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Weekly Tasks
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

        {/* Weekly Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Weekly Summary
          </h2>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Daily Tasks (Week Total)
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.week.dailyTasksCompleted} / {stats.week.dailyTasksTotal}
              </span>
            </div>
            {renderProgressBar(
              stats.week.dailyTasksCompleted,
              stats.week.dailyTasksTotal
            )}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Weekly Tasks Progress
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Tasks Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Daily Tasks Completion
          </h2>

          {dailyTaskHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dailyTaskHistory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="Completion Rate (%)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Tasks Completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Tasks"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No daily task data available for this week yet
            </div>
          )}
        </div>

        {/* Weekly Tasks Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Weekly Tasks Progression
          </h2>

          {weeklyTaskHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weeklyTaskHistory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Tasks Completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Tasks"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="Completion Percentage"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No weekly task data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddList;

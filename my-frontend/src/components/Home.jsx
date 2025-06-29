import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import axios from "axios";
import "./Home.css";

export default function Home() {
  const [userPoints, setUserPoints] = useState(0);
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState(0);
  const [reward, setReward] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const userId = localStorage.getItem("userId");

  const isActive = (path) => location.pathname === path;

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    // setTitle("");
  };
  function handleLogout() {
    localStorage.removeItem("userId");
    navigate("/login");
  }

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:5000/api/rewards")
  //     .then((res) => setReward(res.data));
  // }, []);
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/rewards")
      .then((res) => setReward(res.data))
      .catch((err) => console.log("Error fetching tasks:", err));

    if (userId) {
      axios
        .get(`http://localhost:5000/api/profile/${userId}`)
        .then((res) => setUserPoints(res.data.points))
        .catch((err) => console.log("Error fetching user data:", err));
    }
  }, [userId]);
  const addTask = () => {
    if (!title.trim()) return;
    axios
      .post("http://localhost:5000/api/rewards", {
        title,
        cost,
        achieved: false,
        userId,
      })
      .then((res) => setReward([...reward, res.data]));
    setTitle("");
    setCost(0);
    setIsModalOpen(false);
  };

  function deleteListItem(id) {
    axios
      .delete(`http://localhost:5000/api/rewards/${id}`, {
        data: { userId: userId },
      })
      .then(() => setReward(reward.filter((task) => task._id !== id)))
      .catch((err) => {
        console.error(err);
      });
  }

  const toggleComplete = async (id, currentStatus) => {
    try {
      const updateData = {
        completed: !currentStatus,
        userId,
      };
      const response = await axios.patch(
        `http://localhost:5000/api/rewards/${id}`,
        updateData
      );
      if (response.data.userPoints !== undefined) {
        setUserPoints(response.data.userPoints);
      }
      setReward(reward.map((task) => (task._id === id ? response.data : task)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  function handleLogout() {
    localStorage.removeItem("userId");
    navigate("/login");
  }
  // const [darkMode, setDarkMode] = useState(false);

  // useEffect(() => {
  //   // Check if dark class exists on initial load
  //   const isDark = document.documentElement.classList.contains("dark");
  //   setDarkMode(isDark);
  // }, []);

  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // }, [darkMode]);

  // const toggleDarkMode = () => setDarkMode((prev) => !prev);

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
      <div className="home-container">
        {/* <div className="section profile">
          <h2>Profile</h2>
          <img
            src="/api/placeholder/400/400"
            alt="User Profile"
            className="profile-img"
          />
          <p className="profile-name">User Name</p>
          <p style={{ color: "rgb(51, 177, 235)" }} className="profile-date">
            Today's date {formattedDate}
          </p>
          <p style={{ color: "#328E6E" }}>Your point is: {points} points</p>
          <div className="flex justify-between mt-6">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        </div> */}
        <ProfileCard />
        <div className="section reward">
          <h2>Reward</h2>
          <div className="mb-6 max-w-4xl mx-auto px-4">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
              onClick={openModal}
            >
              <span className="mr-1 font-bold text-lg">+</span> Add New Reward
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reward.map((task) => (
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
                          onChange={() =>
                            toggleComplete(task._id, task.completed)
                          }
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
                          {task.cost} points
                        </span>
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
                    htmlFor="reard-title"
                  >
                    Reward Title
                  </label>
                  <input
                    id="reard-title"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="Enter reward title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                    htmlFor="reward-cost"
                  >
                    Cost
                  </label>
                  <input
                    id="reward-cost"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="Points"
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value) || 0}
                    min="0"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addTask}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileCard() {
  const { id } = useParams();
  const [user, setUser] = useState({
    username: "",
    email: "",
    profileImage: null,
    points: 0,
    joinDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
  });
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        //setLoading(true);
        const targetId = id || userId;
        if (!targetId) {
          setError("No user found");
          return;
        }
        const response = await axios.get(
          `http://localhost:5000/api/auth/user/${targetId}`
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile");
      }
    };

    fetchProfile();
  }, [id, userId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditFormData({
        username: user.username,
        email: user.email,
      });
      setNewProfileImage(null);
      setImagePreview(null);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        ...user,
        username: editFormData.username,
        email: editFormData.email,
        profileImage: imagePreview || user.profileImage,
      });
      setIsLoading(false);
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }, 1500);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && !user.username) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="relative">
            <img
              src={`http://localhost:5000${user.profileImage}`}
              alt={`${user.username}'s profile`}
              className="h-32 w-32 rounded-full border-4 border-white object-cover"
            />
            {user.points > 1000 && (
              <span className="absolute top-0 right-0 bg-yellow-500 text-xs font-bold px-2 py-1 rounded-full border-white">
                PRO
              </span>
            )}
          </div>
          <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <div className="mt-2 flex items-center justify-center md:justify-start">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {user.points} Points
              </span>
            </div>
          </div>
          <div className="md:ml-auto mt-4 md:mt-0">
            <button
              onClick={handleEditToggle}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {updateSuccess && (
        <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mb-4">
          <p>Profile updated successfully!</p>
        </div>
      )}

      <div className="p-6">
        {isEditing ? (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Edit Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={imagePreview || user.profileImage}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image-edit"
                    />
                    <label
                      htmlFor="profile-image-edit"
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm"
                    >
                      Choose New Image
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                User Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                    Email
                  </h3>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {user.email}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                    Username
                  </h3>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    @{user.username}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                    Member Since
                  </h3>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(user.registrationDate)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                    Points
                  </h3>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {user.points}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Achievements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {user.points >= 100 && (
                  <div className="bg-green-50 dark:bg-green-900/50 p-3 rounded-lg text-center">
                    <div className="bg-green-100 dark:bg-green-800 mx-auto h-12 w-12 flex items-center justify-center rounded-full mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      First 100 Points
                    </h3>
                  </div>
                )}

                {user.points >= 500 && (
                  <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-lg text-center">
                    <div className="bg-blue-100 dark:bg-blue-800 mx-auto h-12 w-12 flex items-center justify-center rounded-full mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Power User
                    </h3>
                  </div>
                )}

                {user.points >= 1000 && (
                  <div className="bg-purple-50 dark:bg-purple-900/50 p-3 rounded-lg text-center">
                    <div className="bg-purple-100 dark:bg-purple-800 mx-auto h-12 w-12 flex items-center justify-center rounded-full mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600 dark:text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Expert Status
                    </h3>
                  </div>
                )}

                {user.points >= 5000 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/50 p-3 rounded-lg text-center">
                    <div className="bg-yellow-100 dark:bg-yellow-800 mx-auto h-12 w-12 flex items-center justify-center rounded-full mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Master
                    </h3>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity to display
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

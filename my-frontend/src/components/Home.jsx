import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import axios from "axios";
import {
  Trophy,
  Gift,
  Star,
  Plus,
  X,
  Check,
  Coins,
  Zap,
  Target,
} from "lucide-react";

import "./Home.css";

export default function Home() {
  const [userPoints, setUserPoints] = useState(0);
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState(0);
  const [rewards, setReward] = useState([]);
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

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/rewards/daily-reward/${userId}`)
      .then((res) => setReward(res.data))
      .catch((err) => console.log("Error fetching rewards:", err));
  }, [userId]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/rewards/${userId}`)
      .then((res) => setReward(res.data))
      .catch((err) => console.log("Error fetching rewards:", err));

    if (userId) {
      axios
        .get(`http://localhost:5000/api/profile/${userId}`)
        .then((res) => setUserPoints(res.data.points))
        .catch((err) => console.log("Error fetching user data:", err));
    }
  }, [userId]);
  const addReward = () => {
    if (!title.trim()) return;
    axios
      .post("http://localhost:5000/api/rewards", {
        title,
        cost,
        achieved: false,
        userId,
      })
      .then((res) => setReward([...rewards, res.data]));
    setTitle("");
    setCost(0);
    setIsModalOpen(false);
  };

  function deleteListItem(id) {
    axios
      .delete(`http://localhost:5000/api/rewards/${id}`, {
        data: { userId: userId },
      })
      .then(() => setReward(rewards.filter((task) => task._id !== id)))
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
      setReward(
        rewards.map((task) => (task._id === id ? response.data : task))
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  function handleLogout() {
    localStorage.removeItem("userId");
    navigate("/login");
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Navigation */}
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
        {/* Profile Card */}
        <ProfileCard />

        {/* Rewards Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-8 h-8 text-purple-500" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-7">
                Your Rewards ({rewards.length})
              </h2>
            </div>
            <button
              onClick={openModal}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Reward</span>
            </button>
          </div>

          {/* Empty State */}
          {rewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                No rewards yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Add your first reward to get started!
              </p>
            </div>
          )}

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(rewards) &&
              rewards.map((reward) => (
                <div
                  key={reward._id}
                  className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${
                    reward.completed
                      ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <button
                      onClick={() =>
                        toggleComplete(reward._id, reward.completed)
                      }
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        reward.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-green-400"
                      }`}
                    >
                      {reward.completed && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => deleteListItem(reward._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3
                      className={`font-semibold text-gray-800 dark:text-white ${
                        reward.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {reward.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span
                          className={`font-bold ${
                            userPoints >= reward.cost
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-500 dark:text-red-400"
                          }`}
                        >
                          {reward.cost} pts
                        </span>
                      </div>
                      {userPoints >= reward.cost && !reward.completed && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {reward.completed && (
                    <div className="absolute top-2 right-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Add Reward Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
                    <Gift className="w-6 h-6 text-purple-500" />
                    <span>Add New Reward</span>
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reward Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Enter reward title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Cost (Points)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Enter point cost"
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-8">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addReward}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Add Reward
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
        setIsLoading(true);
        const targetId = id || userId;
        if (!targetId) {
          setError("No user found");
          return;
        }
        const response = await axios.get(
          `http://localhost:5000/api/auth/user/${targetId}`
        );
        setUser(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile");
        setIsLoading(false);
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
    try {
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

        setNewProfileImage(null);
        setImagePreview(null);

        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsLoading(false);
      setError("Failed to update profile");
    }
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
    <div className="max-w-5xl mx-auto mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-black">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <img
                src={`http://localhost:5000${user.profileImage}`}
                alt={`${user.username}'s profile`}
                className="relative h-32 w-32 lg:h-40 lg:w-40 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-xl"
              />
              {user.points > 1000 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-lg">
                  PRO
                </div>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
                {user.username}
              </h1>
              <p className="text-slate-300 dark:text-slate-400 text-lg mb-4">
                @{user.username.toLowerCase().replace(" ", "")}
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold text-sm">
                    {user.points.toLocaleString()} Points
                  </span>
                </div>
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full px-4 py-2">
                  <span className="text-slate-300 dark:text-slate-400 text-sm">
                    Member since {new Date(user.registrationDate).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEditToggle}
                className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {updateSuccess && (
        <div className="m-6 mb-0 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-emerald-800 dark:text-emerald-200 font-medium">
              Profile updated successfully!
            </p>
          </div>
        </div>
      )}

      <div className="p-8">
        {isEditing ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Edit Profile
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-6">
                    <img
                      src={imagePreview || user.profileImage}
                      alt="Profile preview"
                      className="h-20 w-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-md"
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Choose New Image
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleEditToggle}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Profile Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-blue-700 dark:text-blue-300 text-sm font-semibold uppercase tracking-wide">
                      Email
                    </h3>
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg truncate">
                    {user.email}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-purple-700 dark:text-purple-300 text-sm font-semibold uppercase tracking-wide">
                      Username
                    </h3>
                    <svg
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    @{user.username.toLowerCase().replace(" ", "")}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold uppercase tracking-wide">
                      Member Since
                    </h3>
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {formatDate(user.registrationDate)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-amber-700 dark:text-amber-300 text-sm font-semibold uppercase tracking-wide">
                      Points
                    </h3>
                    <svg
                      className="w-5 h-5 text-amber-600 dark:text-amber-400"
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
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {user.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                Achievements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.points >= 100 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-xl text-center border border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-shadow">
                    <div className="bg-emerald-500 mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4 shadow-lg">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      First Century
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      100+ Points
                    </p>
                  </div>
                )}

                {user.points >= 500 && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl text-center border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                    <div className="bg-blue-500 mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4 shadow-lg">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Power User
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      500+ Points
                    </p>
                  </div>
                )}

                {user.points >= 1000 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl text-center border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                    <div className="bg-purple-500 mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4 shadow-lg">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Expert Status
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      1000+ Points
                    </p>
                  </div>
                )}

                {user.points >= 5000 && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-xl text-center border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow">
                    <div className="bg-amber-500 mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4 shadow-lg">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Master
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      5000+ Points
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Recent Activity
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No recent activity to display
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Your activity will appear here once you start using the
                    platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

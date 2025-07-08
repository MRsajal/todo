import React, { useRef, useState } from "react";
import axios from "axios";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

const BASE_URL = "http://localhost:5000";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  return (
    // <form onSubmit={handleRegister}>
    //   <input
    //     type="email"
    //     placeholder="Email"
    //     value={email}
    //     onChange={(e) => setEmail(e.target.value)}
    //     required
    //   />
    //   <input
    //     type="password"
    //     placeholder="Passoword"
    //     value={password}
    //     onChange={(e) => setPassword(e.target.value)}
    //     required
    //   />
    //   <button type="submit">Register</button>
    // </form>
    <Reg />
  );
}

function Reg() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    points: 0,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const usernameCheckTimeout = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error[name]) {
      setErrors({
        ...error,
        [name]: "",
      });
    }
    if (name === "username" && value.length >= 3) {
      clearTimeout(usernameCheckTimeout.current);
      setUsernameAvailable(null);
      usernameCheckTimeout.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/auth/check-username/${username}`
      );
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking username", error);
      setUsernameAvailable(false);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "User is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 charactes";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    if (!profileImage) {
      newErrors.profileImage = "Profile image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (usernameAvailable === false) {
      setErrors({
        ...error,
        username: "This username is already taken",
      });
      return;
    }
    setIsLoading(true);
    try {
      const today = new Date().toISOString();
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("points", 0);
      data.append("profile", profileImage);

      await axios.post(`${BASE_URL}/api/auth/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      setErrors({
        ...error,
        form: message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join us today</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          {error.form && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm font-medium">{error.form}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    error.username ? "border-red-500/50" : "border-white/10"
                  }`}
                />
              </div>
              {error.username && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error.username}
                </p>
              )}
              {formData.username.length >= 3 && (
                <div className="mt-2">
                  {usernameAvailable === null ? (
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin"></div>
                      Checking availability...
                    </p>
                  ) : usernameAvailable ? (
                    <p className="text-sm text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Username is available
                    </p>
                  ) : (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Username is already taken
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    error.email ? "border-red-500/50" : "border-white/10"
                  }`}
                />
              </div>
              {error.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    error.password ? "border-red-500/50" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {error.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    error.confirmPassword
                      ? "border-red-500/50"
                      : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {error.confirmPassword && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error.confirmPassword}
                </p>
              )}
            </div>

            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 cursor-pointer hover:bg-white/10 transition-all duration-200"
                >
                  <Upload className="w-5 h-5" />
                  Choose Image
                </label>
                {imagePreview && (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              {error.profileImage && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error.profileImage}
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-slate-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

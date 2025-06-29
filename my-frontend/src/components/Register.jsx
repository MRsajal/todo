import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
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
        `http://localhost:5000/api/auth/check-username/${username}`
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

      await axios.post("http://localhost:5000/api/auth/register", data, {
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

      {error.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error.form}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              error.username ? "border-red-500" : "border-gray-300"
            }`}
          />
          {error.username && (
            <p className="mt-1 text-sm text-red-500">{error.username}</p>
          )}
          {formData.username.length >= 3 && (
            <div className="mt-1">
              {usernameAvailable === null ? (
                <p className="text-sm text-gray-500">
                  Checking availability...
                </p>
              ) : usernameAvailable ? (
                <p className="text-sm text-green-500">Username is available</p>
              ) : (
                <p className="text-sm text-red-500">
                  Username is already taken
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              error.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {error.email && (
            <p className="mt-1 text-sm text-red-500">{error.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              error.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {error.password && (
            <p className="mt-1 text-sm text-red-500">{error.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              error.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {error.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{error.confirmPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Image
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="profile-image"
            />
            <label
              htmlFor="profile-image"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition"
            >
              Choose Image
            </label>
            {imagePreview && (
              <div className="h-16 w-16 rounded-full overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          {error.profileImage && (
            <p className="mt-1 text-sm text-red-500">{error.profileImage}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Register"}
        </button>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}

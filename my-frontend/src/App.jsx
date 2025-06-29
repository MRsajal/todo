import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import Login from "./components/Login";
import Register from "./components/Register";
import AddList from "./components/Addlist";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router";
import Home from "./components/Home";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userId")
  );
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("userId"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/tasks"
          element={isLoggedIn ? <AddList /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

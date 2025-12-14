// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import { setAuthToken } from "./lib/api";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import CartPage from "./pages/CartPage";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // read auth from localStorage on first load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token) {
      setAuthToken(token);
      setUser(userStr ? JSON.parse(userStr) : null);
    }
  }, []);

  // Keep auth in sync across multiple tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") {
        const token = e.newValue;
        setAuthToken(token || null);
      }
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
      // if somebody cleared token/user in another tab, navigate to login
      if (e.key === "token" && !e.newValue) {
        navigate("/login");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-white">
      {/* Navbar manages top UI and logout action */}
      <Navbar user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel user={user} />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
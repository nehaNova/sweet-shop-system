import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../lib/api";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { syncToServer } = useCart(); // 🧠 access CartContext for sync

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;

      // ✅ Save credentialsx
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      setUser(user);

      // 🛒 Try to sync local cart to server (best-effort)
      try {
        await syncToServer(user);
      } catch (syncErr) {
        console.warn("Cart sync failed:", syncErr);
        toast.warn("Cart sync failed (will retry later)");
      }

      toast.success(`Welcome back, ${user.username || "friend"}!`);

      // redirect admins to admin panel, others to home
      if (user?.role === "admin") {
        nav("/admin");
      } else {
        nav("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      const msg = error?.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-50 to-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-pink-600">
          Welcome Back 🍬
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-semibold transition ${
              loading
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600 text-white shadow-sm"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-600">
          Use <code>test1@example.com</code> or <code>admin@example.com</code><br />
          (password: <code>admin123</code> or your registered one)
        </div>
      </div>
    </div>
  );
}
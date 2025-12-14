import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../lib/api";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { syncToServer } = useCart();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/register", { username, email, password });
      const { token, user } = res.data;

      // Save user & token
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      if (typeof setUser === "function") setUser(user);

      // Best-effort cart sync (don't block registration if it fails)
      try {
        await syncToServer(user);
      } catch (syncErr) {
        console.warn("Cart sync failed (non-fatal):", syncErr);
        toast.warn("Cart sync couldn't complete — it will retry later.");
      }

      toast.success(`Welcome to Sweetify, ${user.username || "friend"}! 🍭`);
      if (user?.role === "admin") nav("/admin");
      else nav("/");
    } catch (error) {
      console.error("Register failed:", error);
      const msg = error?.response?.data?.message || "Registration failed. Try again!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-50 to-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-pink-600">
          Create Your Account 🍰
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <label className="sr-only" htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

          <label className="sr-only" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

          <label className="sr-only" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => nav("/login")}
            className="text-pink-600 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
// src/pages/AdminPanel.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
import AddSweetForm from "../components/AddSweetForm";
import EditSweetModal from "../components/EditSweetModal";
import RestockModal from "../components/RestockModal";
import { toast } from "react-toastify";

export default function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [activeSweet, setActiveSweet] = useState(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.info("Admin access required");
      navigate("/");
    }
  }, [user, navigate]);

  const fetchSweets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/sweets");
      setSweets(res.data || []);
    } catch (err) {
      console.error("Fetch sweets (admin) failed", err);
      toast.error("Failed to load sweets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSweets();
  }, [fetchSweets]);

  const stats = useMemo(() => {
    const total = sweets.length;
    let outOfStock = 0;
    let lowStock = 0;
    sweets.forEach((s) => {
      const st = typeof s.stock === "number" ? s.stock : null;
      if (st !== null) {
        if (st === 0) outOfStock++;
        if (st > 0 && st <= 5) lowStock++;
      }
    });
    return { total, outOfStock, lowStock };
  }, [sweets]);

  const onEdit = (sweet) => {
    setActiveSweet(sweet);
    setEditOpen(true);
  };
  const onRestock = (sweet) => {
    setActiveSweet(sweet);
    setRestockOpen(true);
  };
  const onDelete = async (sweet) => {
    if (!window.confirm(`Delete "${sweet.name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/sweets/${sweet._id}`);
      toast.success("Deleted");
      await fetchSweets();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };
  const onAdded = async () => {
    setAddOpen(false);
    toast.success("Sweet added");
    await fetchSweets();
  };
  const onUpdated = async () => {
    setEditOpen(false);
    setActiveSweet(null);
    toast.success("Updated");
    await fetchSweets();
  };
  const onRestocked = async () => {
    setRestockOpen(false);
    setActiveSweet(null);
    toast.success("Restocked");
    await fetchSweets();
  };

  const visibleSweets = useMemo(() => {
    let list = sweets.slice();
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.category || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "oldest") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "low-stock") list.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    return list;
  }, [sweets, debouncedQuery, sortBy]);

  return (
    <main className="relative max-w-6xl mx-auto px-4 py-8 bg-gradient-to-b from-pink-50 via-yellow-50 to-white min-h-screen rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-pink-600 flex items-center gap-2">
            🍭 Admin Dashboard
          </h1>
          <p className="text-sm text-brown-600 mt-1">
            Manage sweets, stock, and keep Sweetify’s treats always fresh!
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-pink-500 text-white rounded-md shadow hover:bg-pink-600 transition"
          >
            + Add Sweet
          </button>
          <button
            onClick={fetchSweets}
            className="px-4 py-2 bg-white border border-pink-200 rounded-md text-pink-600 hover:bg-pink-50 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-pink-100 to-yellow-100 p-4 rounded-lg shadow text-brown-800">
          <div className="text-sm opacity-70">Total Sweets</div>
          <div className="text-3xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-lg shadow text-red-700">
          <div className="text-sm opacity-70">Out of stock</div>
          <div className="text-3xl font-bold mt-1">{stats.outOfStock}</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-100 to-green-100 p-4 rounded-lg shadow text-yellow-700">
          <div className="text-sm opacity-70">Low stock (≤5)</div>
          <div className="text-3xl font-bold mt-1">{stats.lowStock}</div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or category..."
          className="px-3 py-2 border border-pink-200 rounded-lg w-full sm:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="low-stock">Low stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-pink-100 overflow-x-auto">
        <table className="min-w-[600px] w-full table-auto text-sm">
          <thead>
            <tr className="text-left text-pink-600 border-b bg-pink-50">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Price</th>
              <th className="py-2 px-3">Stock</th>
              <th className="py-2 px-3">Created</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : visibleSweets.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">No sweets found.</td>
              </tr>
            ) : (
              visibleSweets.map((s) => (
                <tr key={s._id} className="border-b hover:bg-pink-50 transition">
                  <td className="py-2 px-3 font-medium text-brown-800">{s.name}</td>
                  <td className="py-2 px-3 text-gray-700">{s.category}</td>
                  <td className="py-2 px-3 text-brown-700">₹{s.price}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                        s.stock === 0
                          ? "bg-red-100 text-red-600"
                          : s.stock <= 5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {typeof s.stock === "number" ? s.stock : "—"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-3 flex flex-wrap gap-2">
                    <button onClick={() => onEdit(s)} className="px-2 py-1 text-xs bg-pink-100 text-pink-700 border border-pink-200 rounded hover:bg-pink-200">Edit</button>
                    <button onClick={() => onRestock(s)} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-200">Restock</button>
                    <button onClick={() => onDelete(s)} className="px-2 py-1 text-xs bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add Button for Mobile */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-4 right-4 z-50 md:hidden flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-pink-500 text-white hover:bg-pink-600 transition"
        title="Add Sweet"
        aria-label="Add Sweet"
      >
        +
      </button>

      {/* Modals */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg p-5 w-full max-w-3xl shadow-lg border border-pink-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-pink-600">Add New Sweet</h3>
              <button onClick={() => setAddOpen(false)} className="text-gray-600 hover:text-pink-600">Close</button>
            </div>
            <AddSweetForm onAdded={onAdded} onCancel={() => setAddOpen(false)} />
          </div>
        </div>
      )}

      {editOpen && activeSweet && (
        <EditSweetModal sweet={activeSweet} onClose={() => setEditOpen(false)} onSaved={onUpdated} />
      )}

      {restockOpen && activeSweet && (
        <RestockModal sweet={activeSweet} onClose={() => setRestockOpen(false)} onSaved={onRestocked} />
      )}
    </main>
  );
}
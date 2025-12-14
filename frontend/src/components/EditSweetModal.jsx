// src/components/EditSweetModal.jsx
import React, { useState } from "react";
import API from "../lib/api";

export default function EditSweetModal({ sweet, onClose, onSaved }) {
  const [name, setName] = useState(sweet.name || "");
  const [description, setDescription] = useState(sweet.description || "");
  const [price, setPrice] = useState(sweet.price || 0);
  const [category, setCategory] = useState(sweet.category || "Candy");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const payload = { name, description, price: Number(price), category };
      const res = await API.put(`/sweets/${sweet._id}`, payload, headers);
      onSaved(res.data?.sweet || res.data);
    } catch (err) {
      console.error("Edit failed", err);
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-5 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Sweet</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option>Candy</option>
              <option>Chocolate</option>
              <option>Pastry</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Stock</label>
            <div className="px-3 py-2 text-sm text-gray-700">{typeof sweet.stock === "number" ? sweet.stock : "Hidden"}</div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className={"px-4 py-2 rounded text-white " + (saving ? "bg-gray-400" : "bg-blue-600")}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
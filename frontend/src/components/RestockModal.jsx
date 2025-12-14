// src/components/RestockModal.jsx
import React, { useState } from "react";
import API from "../lib/api";

export default function RestockModal({ sweet, onClose, onSaved }) {
  const [qty, setQty] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleRestock = async () => {
    if (!Number.isInteger(Number(qty)) || Number(qty) <= 0) { alert("Enter valid quantity"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await API.post(`/sweets/${sweet._id}/restock`, { quantity: Number(qty) }, headers);
      onSaved(res.data?.sweet || res.data);
    } catch (err) {
      console.error("Restock failed", err);
      alert(err?.response?.data?.message || "Restock failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Restock — {sweet.name}</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Quantity to add</label>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={handleRestock} disabled={saving} className={"px-4 py-2 rounded text-white " + (saving ? "bg-gray-400" : "bg-green-600")}>
            {saving ? "Saving..." : "Restock"}
          </button>
        </div>
      </div>
    </div>
  );
}
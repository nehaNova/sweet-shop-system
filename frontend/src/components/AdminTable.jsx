// src/components/AdminTable.jsx
import React, { useMemo, useState } from "react";

export default function AdminTable({ sweets = [], loading, onEdit, onRestock, onDelete }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ field: "createdAt", dir: -1 });

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    let list = sweets.slice();
    if (lower) {
      list = list.filter((s) => (s.name || "").toLowerCase().includes(lower) || (s.category || "").toLowerCase().includes(lower));
    }
    // sort
    list.sort((a, b) => {
      const f = sort.field;
      const av = a[f] ?? "";
      const bv = b[f] ?? "";
      if (av === bv) return 0;
      if (sort.dir === 1) return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    return list;
  }, [sweets, q, sort]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or category..."
          className="px-3 py-2 border rounded w-72"
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort</label>
          <select
            value={`${sort.field}_${sort.dir}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split("_");
              setSort({ field, dir: Number(dir) });
            }}
            className="px-2 py-1 border rounded"
          >
            <option value="createdAt_-1">Newest</option>
            <option value="createdAt_1">Oldest</option>
            <option value="price_1">Price (low → high)</option>
            <option value="price_-1">Price (high → low)</option>
            <option value="stock_1">Stock (low → high)</option>
            <option value="stock_-1">Stock (high → low)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="text-sm text-gray-600 border-b">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-3 py-6 text-center">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="px-3 py-6 text-center text-gray-500">No items</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 align-top">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.description?.slice(0, 80)}</div>
                  </td>
                  <td className="px-3 py-3 align-top">{s.category}</td>
                  <td className="px-3 py-3 align-top">₹{s.price}</td>
                  <td className="px-3 py-3 align-top">
                    {typeof s.stock === "number" ? (
                      s.stock === 0 ? <span className="text-red-600 font-medium">0</span> : <span>{s.stock}</span>
                    ) : (
                      <span className="text-gray-400 italic">Hidden</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top text-sm text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(s)} className="px-3 py-1 border rounded text-sm">Edit</button>
                      <button onClick={() => onRestock(s)} className="px-3 py-1 border rounded text-sm">Restock</button>
                      <button onClick={() => onDelete(s)} className="px-3 py-1 border rounded text-sm text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
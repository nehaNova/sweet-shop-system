import React, { useState } from "react";
import API from "../lib/api";
import { toast } from "react-toastify";

/**
 * AddSweetForm
 * Props:
 *  - onAdded(sweet)   optional callback called after successful add
 *  - onCancel()       optional callback to close/hide form
 */
export default function AddSweetForm({ onAdded, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Candy");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState(null); // File object
  const [imgPreview, setImgPreview] = useState(null); // dataURL
  const [loading, setLoading] = useState(false);

  // Validate form
  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!price || isNaN(Number(price)) || Number(price) < 0) return "Price must be a positive number";
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) return "Stock must be a non-negative integer";
    return null;
  };

  // convert file -> dataURL (base64) for simple storage as image string
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setImageFile(null);
      setImgPreview(null);
      return;
    }
    // quick client validation
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      e.target.value = "";
      return;
    }
    setImageFile(f);
    // preview
    const url = URL.createObjectURL(f);
    setImgPreview(url);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      // If user uploaded an image, convert to data URL and send as image string.
      // (Your backend expects `image` field — either URL or dataURL)
      let image = "";
      if (imageFile) {
        image = await fileToDataUrl(imageFile);
      }

      // build payload
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        stock: Number(stock),
        image: image || undefined, // omit if empty
      };

      // If you use setAuthToken earlier in app start, API will already have header.
      // But to be safe, attach token from localStorage if present.
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await API.post("/sweets", payload, { headers });

      toast.success("Sweet added successfully");
      // clear
      setName("");
      setDescription("");
      setPrice("");
      setCategory("Candy");
      setStock("");
      setImageFile(null);
      setImgPreview(null);

      if (onAdded) onAdded(res.data?.sweet || res.data);
    } catch (e) {
      // better error messaging
      const msg = e?.response?.data?.message || e.message || "Failed to add sweet";
      toast.error(msg);
      console.error("Add sweet error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Add New Sweet</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="e.g. Strawberry Candy"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option>Candy</option>
            <option>Chocolate</option>
            <option>Pastry</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Price (INR)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g. 49.00"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Stock (admin only)</label>
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            min="0"
            step="1"
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g. 100"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded min-h-[80px]"
          placeholder="Short description"
        />
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium block mb-1">Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="block" />
          <p className="text-xs text-gray-500 mt-1">Supported: png, jpeg. Small images recommended.</p>
        </div>

        <div className="w-28 h-28 bg-gray-50 border rounded flex items-center justify-center overflow-hidden">
          {imgPreview ? (
            <img src={imgPreview} alt="preview" className="object-cover w-full h-full" />
          ) : (
            <div className="text-xs text-gray-400 text-center px-2">Preview</div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className={
            "px-4 py-2 rounded text-white " +
            (loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")
          }
        >
          {loading ? "Saving..." : "Add Sweet"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
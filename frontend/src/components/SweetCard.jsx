// src/components/SweetCard.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { triggerLoginFocus } from "../lib/globalSignals";

export default function SweetCard({ item, onOpenQuantity, isProcessing }) {
  const { addItem } = useCart();

  // ---- Stock logic ----
  const hasStockField = typeof item.stock === "number";
  const outOfStock = hasStockField && item.stock <= 0;
  const lowStock = hasStockField && item.stock > 0 && item.stock <= 5;

  const handleAddToCart = async (e) => {
    e.preventDefault();

    // require login before adding to persistent cart
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please login to add items to cart");
      triggerLoginFocus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (outOfStock) {
      toast.error(`${item.name} is out of stock`);
      return;
    }

    try {
      await addItem(item, 1);
      toast.success(`Added 1 × ${item.name} to cart`);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Add to cart failed:", err);
      if (!err?.response) {
        toast.error("Couldn't add to cart. Network error — try again.");
      }
      // server errors handled by API interceptor
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col border border-pink-100 hover:border-pink-200">
      {/* --- Image --- */}
      <div className="relative">
        <img
          src={item.image || "https://via.placeholder.com/600x400?text=Sweet"}
          alt={item.name}
          className="w-full h-44 object-cover rounded-lg"
          loading="lazy"
        />

        {/* Category Badge */}
        <div className="absolute left-3 top-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-pink-600 shadow-sm">
          {item.category || "Other"}
        </div>

        {/* Low Stock Badge */}
        {lowStock && (
          <div className="absolute right-3 top-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold shadow-sm">
            Low stock
          </div>
        )}
      </div>

      {/* --- Info --- */}
      <div className="flex-1 mt-3">
        <h3 className="font-semibold text-lg text-pink-700">{item.name}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {item.description || "No description available."}
        </p>
      </div>

      {/* --- Price + Buttons --- */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Price</div>
          <div className="font-semibold text-lg text-gray-800">₹{item.price}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`px-3 py-2 rounded-md text-sm font-medium border transition ${
              outOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-800 border-gray-200 hover:bg-pink-50 hover:border-pink-200"
            }`}
            title={outOfStock ? "Out of stock" : "Add to cart"}
            aria-disabled={outOfStock}
            aria-label={outOfStock ? `Out of stock: ${item.name}` : `Add ${item.name} to cart`}
          >
            + Cart
          </button>

          {/* Buy Now */}
          <button
            onClick={() => onOpenQuantity && onOpenQuantity(item)}
            disabled={isProcessing || outOfStock}
            className={`px-3 py-2 rounded-md text-sm font-semibold transition ${
              outOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isProcessing
                ? "bg-gray-300 text-gray-700 cursor-wait"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
            aria-label={
              outOfStock
                ? `${item.name} is out of stock`
                : isProcessing
                ? `Purchasing ${item.name}`
                : `Buy ${item.name}`
            }
          >
            {outOfStock ? "Out of stock" : isProcessing ? "Processing..." : "Buy"}
          </button>
        </div>
      </div>
    </article>
  );
}
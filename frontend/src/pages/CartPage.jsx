// src/pages/CartPage.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

export default function CartPage() {
  const { items, updateItem, removeItem, clearCart, checkout, loading } = useCart();

  const total = items.reduce((s, it) => s + (it.price || 0) * it.qty, 0);

  const handleCheckout = async () => {
    try {
      await checkout();
      toast.success("Order placed — checkout simulated");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Checkout failed");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-gray-500">Cart is empty</div>
      ) : (
        <div className="space-y-4">
          {items.map(it => (
            <div key={it.itemId || it.sweet} className="flex items-center gap-4 bg-white p-3 rounded shadow">
              <img src={it.image || "https://via.placeholder.com/80"} className="w-20 h-20 object-cover rounded" alt={it.name}/>
              <div className="flex-1">
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-500">₹{it.price} each</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" value={it.qty} min="1" onChange={(e)=> updateItem(it.itemId || it.sweet, Number(e.target.value))} className="w-16 px-2 py-1 border rounded"/>
                <button onClick={() => removeItem(it.itemId || it.sweet)} className="text-red-600">Remove</button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Total: ₹{total}</div>
            <div className="flex gap-2">
              <button onClick={() => clearCart()} className="px-4 py-2 border rounded">Clear</button>
              <button onClick={handleCheckout} className="px-4 py-2 bg-green-600 text-white rounded">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../lib/api";

const STORAGE_KEY = "cart_v1";
const META_KEY = "cart_meta_v1";
const CartContext = createContext(null);

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const metaRaw = localStorage.getItem(META_KEY);
    return {
      items: raw ? JSON.parse(raw) : [],
      meta: metaRaw ? JSON.parse(metaRaw) : { recentViews: [], purchases: [] },
    };
  } catch {
    return { items: [], meta: { recentViews: [], purchases: [] } };
  }
}
function writeStorage(items, meta) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.warn("Cart write failed", err);
  }
}
function normalizeItem(item) {
  return {
    _id: item._id || item.id || item.itemId || (item.item && item.item._id) || String(item),
    name: item.name || item.title || (item.item && item.item.name) || "Item",
    price: typeof item.price === "number" ? item.price : Number(item.price || (item.item && item.item.price) || 0),
    image: item.image || item.img || (item.item && item.item.image) || "",
    category: item.category || (item.item && item.item.category) || "Other",
    description: item.description || (item.item && item.item.description) || "",
  };
}

export default function CartProvider({ children }) {
  const [{ items, meta }, setState] = useState(() => readStorage());
  const [open, setOpen] = useState(false);

  useEffect(() => writeStorage(items, meta), [items, meta]);

  const totalItems = useMemo(() => items.reduce((s, it) => s + (it.quantity || 0), 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0), [items]);

  // local operations
  const addItem = async (rawItem, qty = 1) => {
    const base = normalizeItem(rawItem);
    if (!base._id) throw new Error("Invalid item id");
    const id = String(base._id);
    const exists = items.find((it) => String(it._id) === id);
    let newItems;
    if (exists) {
      newItems = items.map((it) => (String(it._id) === id ? { ...it, quantity: (it.quantity || 0) + qty } : it));
    } else {
      newItems = [...items, { ...base, quantity: qty }];
    }
    setState((s) => ({ items: newItems, meta: s.meta }));
    window.dispatchEvent(new Event("cart-updated"));
    return newItems;
  };

  const removeItem = async (id) => {
    const newItems = items.filter((it) => String(it._id) !== String(id));
    setState((s) => ({ items: newItems, meta: s.meta }));
    window.dispatchEvent(new Event("cart-updated"));
    return newItems;
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) return removeItem(id);
    const newItems = items.map((it) => (String(it._id) === String(id) ? { ...it, quantity } : it));
    setState((s) => ({ items: newItems, meta: s.meta }));
    window.dispatchEvent(new Event("cart-updated"));
    return newItems;
  };

  const clearCart = () => {
    setState((s) => ({ items: [], meta: s.meta }));
    window.dispatchEvent(new Event("cart-updated"));
  };

  // server sync helpers ---------------------------------------------------
  // sync local -> server (merge). Expects user object with _id and token in localStorage
  // safe no-op
// in src/context/CartContext.jsx
const syncToServer = async (user) => {
  const itemsPayload = items.map(it => ({
    item: String(it._id || it.id), // ensure string id and correct key name 'item'
    quantity: it.quantity || 1
  }));

  try {
    // POST to /api/cart/sync (or /api/cart) depending on your route
    const res = await API.post("/cart/sync", { items: itemsPayload });
    // optional: return res.data
    return res.data;
  } catch (err) {
    // swallow so login doesn't fail — but propagate/return something useful
    console.warn("Cart sync failed (frontend):", err?.response?.data || err?.message);
    throw err; // or return { error: true } if you prefer not to throw
  }
};

  // pull server cart -> replace local (useful after login)
  const syncFromServer = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await API.get("/cart");
      if (res?.data?.cart) {
        const mapped = (res.data.cart.items || []).map((ci) => {
          const itm = ci.item || {};
          return {
            _id: itm._id || ci.item,
            name: itm.name,
            price: itm.price,
            image: itm.image,
            category: itm.category,
            quantity: ci.quantity || 1,
          };
        });
        setState((s) => ({ items: mapped, meta: s.meta }));
        return mapped;
      }
      return [];
    } catch (err) {
      console.warn("Cart syncFromServer failed:", err);
      throw err;
    }
  };

  // other helpers
  const addView = (item) => {
    const id = normalizeItem(item)._id;
    const recentViews = (meta.recentViews || []).filter((x) => x !== id);
    recentViews.unshift(id);
    if (recentViews.length > 12) recentViews.pop();
    setState((s) => ({ items: s.items, meta: { ...s.meta, recentViews } }));
  };

  const recordPurchase = (item, qty = 1) => {
    const id = normalizeItem(item)._id;
    const purchases = meta.purchases ? [...meta.purchases] : [];
    const existing = purchases.find((p) => p.id === id);
    if (existing) {
      existing.count += qty;
      existing.last = Date.now();
    } else {
      purchases.unshift({ id, count: qty, last: Date.now(), name: item.name || "" });
      if (purchases.length > 30) purchases.pop();
    }
    setState((s) => ({ items: s.items, meta: { ...s.meta, purchases } }));
  };

  const context = {
    items,
    meta,
    open,
    setOpen,
    totalItems,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    addView,
    recordPurchase,
    syncToServer,
    syncFromServer,
  };

  return <CartContext.Provider value={context}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
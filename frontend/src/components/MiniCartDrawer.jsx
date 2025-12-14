// src/components/MiniCartDrawer.jsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import API from "../lib/api";
import { toast } from "react-toastify";

function Currency({ v }) {
  return <>₹{Number(v || 0).toLocaleString("en-IN")}</>;
}

/**
 * MiniCartDrawer
 * - drawer is implemented with an aside that is a column flex container.
 * - main content (list) is flex-1 and scrollable; footer stays fixed at bottom.
 */
export default function MiniCartDrawer() {
  const [open, setOpen] = useState(false);

  const {
    items = [],
    removeItem = () => {},
    updateQuantity = () => {},
    subtotal = 0,
    clearCart = () => {},
    totalItems = 0,
  } = useCart();

  const [loadingIds, setLoadingIds] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);

  const toggle = () => setOpen((s) => !s);

  const doCheckout = async () => {
    if (!items.length) {
      toast.info("Cart is empty");
      return;
    }
    setCheckingOut(true);
    const token = localStorage.getItem("token");
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const successes = [];
    const failures = [];

    for (const it of items) {
      const id = it._id || it.id;
      setLoadingIds((s) => [...s, id]);
      try {
        await API.post(`/sweets/${id}/purchase`, { quantity: it.quantity || 1 }, headers);
        successes.push(it);
      } catch (err) {
        const msg = err?.response?.data?.message || "Purchase failed";
        failures.push({ item: it, message: msg });
      } finally {
        setLoadingIds((s) => s.filter((x) => x !== id));
      }
    }

    if (successes.length) {
      successes.forEach((s) => {
        const id = s._id || s.id;
        removeItem(id);
      });
      toast.success(`Purchased ${successes.length} item(s)`);
    }

    if (failures.length) {
      failures.forEach((f) => toast.error(`${f.item?.name || "Item"}: ${f.message}`));
      toast.info("Some items failed to purchase. Check messages above.");
    }

    setCheckingOut(false);
    if (!failures.length) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* floating cart button */}
      <div className="fixed right-4 bottom-4 z-40">
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500 text-white shadow-lg"
          aria-label="Open cart"
          title="Open cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21a1 1 0 11-2 0 1 1 0 012 0zm-8 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <CartBadge totalItems={totalItems} />
        </button>
      </div>

      {/* drawer container */}
      <div
        className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />

        {/* panel (flex column so footer remains visible) */}
        <aside
          role="dialog"
          aria-modal="true"
          className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl transform transition-transform ${
            open ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
        >
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="text-lg font-semibold">Your Cart</h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                <Currency v={subtotal} />
              </div>
              <button onClick={() => setOpen(false)} className="px-2 py-1 text-gray-600 border rounded">Close</button>
            </div>
          </div>

          {/* content: scrollable */}
          <div className="p-4 overflow-y-auto flex-1">
            {items.length === 0 ? (
              <div className="text-gray-500">Your cart is empty. Add sweets to get started.</div>
            ) : (
              items.map((it) => {
                const id = it._id || it.id;
                const processing = loadingIds.includes(id);
                return (
                  <div key={id || Math.random()} className="flex items-center gap-3 border-b py-3">
                    <img src={it.image || "https://via.placeholder.com/80"} alt={it.name} className="w-16 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-gray-500">{it.category}</div>
                        </div>
                        <div className="text-sm font-semibold">₹{it.price}</div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(id, Math.max(1, (it.quantity || 1) - 1))}
                          className="px-2 py-1 border rounded"
                          aria-label={`Decrease quantity of ${it.name}`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={it.quantity || 1}
                          onChange={(e) => updateQuantity(id, Number(e.target.value || 1))}
                          className="w-14 text-center px-2 py-1 border rounded"
                          min="1"
                          aria-label={`Quantity for ${it.name}`}
                        />
                        <button
                          onClick={() => updateQuantity(id, (it.quantity || 1) + 1)}
                          className="px-2 py-1 border rounded"
                          aria-label={`Increase quantity of ${it.name}`}
                        >
                          +
                        </button>

                        <button onClick={() => removeItem(id)} className="ml-auto text-sm text-red-600">Remove</button>
                      </div>

                      {processing && <div className="text-xs text-gray-500 mt-1">Processing...</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* footer: stays visible */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">Subtotal</div>
              <div className="text-lg font-semibold"><Currency v={subtotal} /></div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  clearCart();
                  toast.info("Cart cleared");
                }}
                className="w-full px-4 py-2 rounded border"
              >
                Clear
              </button>
              <button
                onClick={doCheckout}
                disabled={checkingOut}
                className={`w-full px-4 py-2 rounded text-white ${checkingOut ? "bg-gray-400" : "bg-pink-500 hover:bg-pink-600"}`}
              >
                {checkingOut ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

/* small badge component that reads total from prop (or fallback from context) */
function CartBadge({ totalItems }) {
  return (
    <div className="relative">
      <span className="sr-only">Cart</span>
      <div className="text-sm">Cart</div>
      {totalItems > 0 && (
        <div className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-1.5">
          {totalItems}
        </div>
      )}
    </div>
  );
}
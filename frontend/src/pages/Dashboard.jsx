// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../lib/api";
import { toast } from "react-toastify";
import SweetCard from "../components/SweetCard";
import QuantityModal from "../components/QuantityModal";
import SkeletonCard from "../components/SkeletonCard";
import useDebounce from "../hooks/useDebounce";
import useRecommendations from "../hooks/useRecommendations";
import { useCart } from "../context/CartContext";
import { pushView, pushPurchase } from "../lib/localSignals";
import { triggerLoginFocus } from "../lib/globalSignals";

export default function Dashboard({ user }) {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const { items: cartItems } = useCart();
  const searchActive = Boolean(debouncedQuery || category || minPrice || maxPrice);
  const recs = useRecommendations({ cartItems, limit: 6, enabled: !searchActive });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ✅ CORRECT FETCH LOGIC
  async function fetchSweets(params = {}) {
    setLoading(true);
    try {
      let res;

      if (Object.keys(params).length === 0) {
        // 🔑 INITIAL LOAD / NO FILTERS
        res = await API.get("/sweets");
      } else {
        // 🔑 SEARCH / FILTERS
        res = await API.get("/sweets/search", { params });
      }

      if (!mountedRef.current) return;

      setSweets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch sweets failed:", err);
      toast.error("Failed to load sweets");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchSweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // search / filters
  useEffect(() => {
    if (searchActive) {
      const params = {};
      if (debouncedQuery) params.q = debouncedQuery;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      fetchSweets(params);
    } else {
      fetchSweets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, category, minPrice, maxPrice]);

  const categories = useMemo(() => {
    const s = new Set();
    sweets.forEach((x) => x.category && s.add(x.category));
    return ["All", ...Array.from(s)];
  }, [sweets]);

  const openBuy = (item) => {
    if (item) pushView(item);
    setSelected(item);
    setModalOpen(true);
  };

  const confirmBuy = async (qty) => {
    if (!selected) return;

    if (!user) {
      toast.info("Please login to continue");
      triggerLoginFocus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setModalOpen(false);
      return;
    }

    setModalOpen(false);
    setProcessingId(selected._id);
    try {
      await API.post(`/sweets/${selected._id}/purchase`, { quantity: qty });
      toast.success(`Purchased ${qty} × ${selected.name}`);
      pushPurchase(selected, qty);
      fetchSweets();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Purchase failed");
    } finally {
      setProcessingId(null);
      setSelected(null);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    fetchSweets();
  };

return (
    <div className="container mx-auto px-4">
      {/* Hero */}
      <section className="bg-gradient-to-r from-pink-50 to-white rounded-lg p-6 mb-6">
        <div className="text-center md:text-left mb-4">
          <h1 className="text-3xl font-bold text-pink-600">Sweetify — Fresh & Tasty</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Shop sweets, chocolates and pastries. Fast delivery and fresh stocks.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sweets, e.g. chocolate..."
            className="px-4 py-2 border rounded-md w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Search sweets"
          />
          <button
            onClick={() => fetchSweets({ q: query, category, minPrice, maxPrice })}
            className="px-5 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => {
            const active = c === "All" ? category === "" : category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c === "All" ? "" : c)}
                className={
                  "px-3 py-1 rounded-full border transition-all " +
                  (active
                    ? "bg-pink-400 text-white border-pink-400 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-pink-50")
                }
                aria-pressed={active}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <input
            type="number"
            placeholder="min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-3 py-2 border rounded w-24"
            aria-label="Minimum price"
          />
          <input
            type="number"
            placeholder="max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-2 border rounded w-24"
            aria-label="Maximum price"
          />
          <button onClick={resetFilters} className="px-3 py-2 border rounded text-sm hover:bg-pink-50">
            Reset
          </button>
        </div>
      </section>

      {/* Products Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sweets.length === 0 ? (
          <div className="text-gray-600 text-center py-10">No sweets found for your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sweets.map((s) => (
              <SweetCard key={s._id} item={s} onOpenQuantity={openBuy} isProcessing={processingId === s._id} />
            ))}
          </div>
        )}
      </section>

      {/* Recommendations: shown only when user is not actively searching */}
      {!searchActive && recs && recs.length > 0 && (
        <section className="mb-6 mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Recommended for you</h2>
            <button onClick={() => fetchSweets()} className="text-sm text-gray-600 hover:text-gray-800">
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recs.map((r) => (
              <SweetCard key={r._id} item={r} onOpenQuantity={openBuy} isProcessing={processingId === r._id} />
            ))}
          </div>
        </section>
      )}

      {/* Quantity Modal */}
      <QuantityModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onConfirm={confirmBuy}
        max={typeof selected?.stock === "number" ? selected.stock : 9999}
        defaultQty={1}
      />

      {/* Footer */}
      <footer className="mt-10 border-t pt-6 pb-4 text-center text-gray-600 text-sm bg-gradient-to-r from-white to-pink-50 rounded-t-xl">
        <p className="font-medium text-pink-600">Sweetify 🍬 — Spreading Happiness, One Sweet at a Time</p>
        <div className="mt-2 flex flex-col sm:flex-row justify-center gap-3 text-gray-500 text-xs">
          <span>© {new Date().getFullYear()} Sweetify. All rights reserved.</span>
          <span>Made with ❤️ by the Sweetify Team.</span>
        </div>
      </footer>
    </div>
  );
}
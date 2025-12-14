// src/hooks/useRecommendations.js
import { useEffect, useMemo, useState } from "react";
import API from "../lib/api";

/*
 Basic scoring:
  - +5 if in same category as recent purchases (strong)
  - +3 if in same category as items currently in cart
  - +2 if in user's recent views
  - +1 if price within +/-20% of user's avg purchase price
  - +popularity (if backend returns)
*/

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

export default function useRecommendations({ cartItems = [], limit = 6 } = {}) {
  const [sweets, setSweets] = useState([]);
  const [popularity, setPopularity] = useState({}); // optional mapping id -> score
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get("/sweets"); // fetch all sweets (or a trimmed list)
        if (!mounted) return;
        setSweets(res.data || res.data?.sweets || []);
      } catch (err) {
        // ignore, UI will remain empty
      }
    })();

    // optionally fetch popularity endpoint if you implement one:
    (async () => {
      try {
        const res = await API.get("/sweets/popularity"); // optional
        if (mounted) setPopularity(res.data || {});
      } catch {}
    })();

    const onUpdate = () => setTick((s) => s + 1);
    window.addEventListener("recommendation-updated", onUpdate);
    return () => { mounted = false; window.removeEventListener("recommendation-updated", onUpdate); };
  }, []);

  const recs = useMemo(() => {
    if (!sweets || sweets.length === 0) return [];

    const purchases = readLocal("purchases");
    const views = readLocal("views");

    // category weights
    const catScore = {};
    purchases.slice(0, 30).forEach((p, idx) => { catScore[p.category] = (catScore[p.category] || 0) + 6 - Math.min(idx,5); });
    views.slice(0, 50).forEach((v, idx) => { catScore[v.category] = (catScore[v.category] || 0) + 2 - Math.min(idx,1); });
    cartItems.forEach(ci => { catScore[ci.item?.category || ci.category] = (catScore[ci.item?.category || ci.category] || 0) + 3; });

    const avgPurchasePrice = purchases.length ? purchases.reduce((s,p)=>s + (p.price||0)*(p.qty||1), 0) / purchases.reduce((s,p)=>s + (p.qty||1), 0) : null;

    const scored = sweets.map(s => {
      let score = 0;
      // category boost
      score += (catScore[s.category] || 0);

      // views presence
      if (views.find(v => v.id === s._id)) score += 3;

      // price proximity
      if (avgPurchasePrice) {
        const p = s.price || 0;
        const delta = Math.abs(p - avgPurchasePrice) / (avgPurchasePrice || 1);
        if (delta <= 0.2) score += 2;
        else if (delta <= 0.5) score += 1;
      }

      // popularity
      if (popularity && popularity[s._id]) score += (popularity[s._id] / 100);

      // small fallback for new items
      if (!s.scoreBoost) score += (s.createdAt ? 0.1 : 0);

      return { s, score };
    });

    // exclude items already in cart (or optionally show them lower)
    const cartIds = new Set((cartItems || []).map(ci => String(ci.item?._id || ci._id || ci.itemId)));
    const filtered = scored.filter(x => !cartIds.has(String(x.s._id)));

    filtered.sort((a,b) => b.score - a.score);
    return filtered.slice(0, limit).map(x => x.s);
  }, [sweets, cartItems, popularity, tick, limit]);

  return recs;
}
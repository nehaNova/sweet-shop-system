// src/lib/localSignals.js
export function pushView(item) {
  try {
    const a = JSON.parse(localStorage.getItem("views") || "[]");
    a.unshift({ id: item._id, category: item.category || "", price: item.price || 0, ts: Date.now() });
    localStorage.setItem("views", JSON.stringify(a.slice(0, 100)));
    window.dispatchEvent(new Event("recommendation-updated"));
  } catch { /* ignore */ }
}

export function pushPurchase(item, qty = 1) {
  try {
    const a = JSON.parse(localStorage.getItem("purchases") || "[]");
    a.unshift({ id: item._id, category: item.category || "", price: item.price || 0, qty, ts: Date.now() });
    localStorage.setItem("purchases", JSON.stringify(a.slice(0, 200)));
    window.dispatchEvent(new Event("recommendation-updated"));
  } catch { /* ignore */ }
}
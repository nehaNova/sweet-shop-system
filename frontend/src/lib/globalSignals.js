// src/lib/globalSignals.js
// Small, robust in-memory event bus for UI signals.
// Uses EventTarget to avoid accidental duplicate function declarations.

const BUS = new EventTarget();

/**
 * Trigger the global "login focus" signal.
 * Use this when you want the Navbar to open and highlight the Login item.
 */
export function triggerLoginFocus() {
  BUS.dispatchEvent(new CustomEvent("loginfocus", { detail: { ts: Date.now() } }));
}

/**
 * Subscribe to login focus events.
 * cb will be called with event.detail.
 * Returns an unsubscribe function.
 */
export function onLoginFocus(cb) {
  const handler = (ev) => {
    try {
      cb(ev.detail);
    } catch (e) {
      // ignore subscriber errors
    }
  };
  BUS.addEventListener("loginfocus", handler);
  return () => BUS.removeEventListener("loginfocus", handler);
}
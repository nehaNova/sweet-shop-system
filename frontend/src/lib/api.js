// src/lib/api.js
import axios from "axios";
import { toast } from "react-toastify";

/* Toggle to true while debugging to log outgoing requests (headers + url) */
const DEBUG_REQUESTS = false;

/**
 * Keep a short-lived cache of network-toasts to avoid flooding the user with identical errors.
 * We register a message into the set and clear it after a short timeout.
 */
const _recentToasts = new Set();
function showDedupeToast(message, opts = {}) {
  if (_recentToasts.has(message)) return;
  _recentToasts.add(message);
  toast.error(message, opts);
  setTimeout(() => _recentToasts.delete(message), 3000); // 3s window to avoid repeat
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5001/api",
  timeout: 20000, // 20s
});

// REQUEST INTERCEPTOR
API.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // If an Authorization header already present, keep it; otherwise set from localStorage
    if (!config.headers["Authorization"]) {
      const token = localStorage.getItem("token");
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (DEBUG_REQUESTS) {
      // eslint-disable-next-line no-console
      console.log(
        "[API request]",
        (config.method || "").toUpperCase(),
        `${config.baseURL || ""}${config.url || ""}`,
        config.headers
      );
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // If request was cancelled (axios v1+ uses 'CanceledError' name), ignore gracefully.
    // Also older axios may set err.__CANCEL__ === true or axios.isCancel(err) === true.
    if (axios.isCancel && axios.isCancel(err)) {
      // request was intentionally cancelled — don't toast
      if (DEBUG_REQUESTS) console.warn("[API] request cancelled", err.message);
      return Promise.reject(err);
    }
    if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
      if (DEBUG_REQUESTS) console.warn("[API] request canceled (name/code)", err);
      return Promise.reject(err);
    }

    // Network-level error (no response): timeout / CORS / server down
    if (!err || !err.response) {
      if (DEBUG_REQUESTS) console.error("[API] Network error or no response:", err);
      // show friendly toast but dedupe to avoid flooding
      showDedupeToast("Network error — check server or your connection");
      return Promise.reject(err);
    }

    const response = err.response;
    const message = response?.data?.message || err.message || "Network error";
    const code = response?.status;
    const lowerMsg = String(message).toLowerCase();

    // Messages that UI already handles (like stock/quantity) — don't duplicate toasts
    const handledByUI =
      lowerMsg.includes("stock") ||
      lowerMsg.includes("quantity") ||
      lowerMsg.includes("insufficient");

    if (code !== 401 && !handledByUI) {
      // dedupe show
      showDedupeToast(message);
    }

    // Central 401 handling: clear credentials and inform user
    if (code === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // show info (not error)
      toast.info("Session expired — please login again");
    }

    if (DEBUG_REQUESTS) {
      // eslint-disable-next-line no-console
      console.error("[API] response error", { status: code, message, data: response?.data });
    }

    return Promise.reject(err);
  }
);

export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
}

export default API;
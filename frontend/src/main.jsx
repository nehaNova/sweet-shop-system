// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import "react-toastify/dist/ReactToastify.css";
import CartProvider from "./context/CartContext";
import MiniCartDrawer from "./components/MiniCartDrawer";
import { ToastContainer } from "react-toastify";

const container = document.getElementById("root");
const root = createRoot(container);

// ✅ Custom wrapper to hide cart on login/register routes
function LayoutWithConditionalCart() {
  const location = useLocation();
  const hideCart =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  return (
    <>
      <App />
      {!hideCart && <MiniCartDrawer />} {/* ✅ show only on normal pages */}
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <LayoutWithConditionalCart />
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
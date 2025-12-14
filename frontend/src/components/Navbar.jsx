// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setAuthToken } from "../lib/api";
import { onLoginFocus } from "../lib/globalSignals";

export default function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightLogin, setHighlightLogin] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // close dropdown on click outside or Esc
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Subscribe to global login focus signal
  useEffect(() => {
    const unsub = onLoginFocus(() => {
      setMenuOpen(true);
      setHighlightLogin(true);
      // reset highlight after animation
      setTimeout(() => setHighlightLogin(false), 1500);
    });
    return unsub;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    if (typeof onLogout === "function") onLogout();
    navigate("/login");
  };

  const goToAdmin = () => {
    setMenuOpen(false);
    navigate("/admin");
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Brand */}
          <Link to="/" className="text-lg font-bold tracking-wide text-pink-700 hover:text-pink-600 transition" aria-label="Sweetify home">
            Sweetify
          </Link>

          {/* Right side */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span className="hidden sm:inline">Menu</span>
            </button>

            {menuOpen && (
              <div role="menu" aria-label="Main menu" className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg overflow-hidden animate-fadeIn ring-1 ring-black ring-opacity-5">
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-pink-50 transition">Home</Link>

                {user?.role === "admin" && (
                  <button onClick={goToAdmin} className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-pink-50 transition">Admin</button>
                )}

                <div className="border-t" />

                {user ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-pink-50 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-2 transition font-medium ${highlightLogin ? "bg-pink-500 text-white animate-focusHighlight" : "text-gray-700 hover:bg-pink-50"}`}
                    >
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-pink-50 transition">Register</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-in-out; }

        @keyframes focusHighlight {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(236,72,153,0.85); }
          40% { transform: scale(1.06); box-shadow: 0 0 12px 6px rgba(236,72,153,0.45); }
          80% { transform: scale(0.98); box-shadow: 0 0 6px 3px rgba(236,72,153,0.3); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(236,72,153,0); }
        }
        .animate-focusHighlight { animation: focusHighlight 1.2s ease-in-out; border-radius: 6px; }
      `}</style>
    </header>
  );
}
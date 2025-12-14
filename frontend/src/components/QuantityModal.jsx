// src/components/QuantityModal.jsx
import React, { useEffect } from "react";

export default function QuantityModal({ open, onClose, onConfirm, max = 9999, defaultQty = 1 }) {
  const [quantity, setQuantity] = React.useState(defaultQty);

  useEffect(() => {
    if (open) setQuantity(defaultQty);
  }, [open, defaultQty]);

  if (!open) return null;

  const handleConfirm = () => {
    if (quantity < 1) return;
    onConfirm(quantity);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
    >
      {/* modal content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg p-6 w-[90%] sm:w-[400px] animate-scaleIn"
      >
        <h3 className="text-lg font-semibold text-pink-600 mb-4 text-center">
          Select Quantity
        </h3>

        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={max}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(Number(e.target.value) || 1, max))}
            className="w-20 text-center border rounded py-1"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
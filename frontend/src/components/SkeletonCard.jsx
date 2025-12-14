// src/components/SkeletonCard.jsx
import React from "react";

export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-card p-4">
      <div className="h-40 bg-gray-200 rounded-md mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}
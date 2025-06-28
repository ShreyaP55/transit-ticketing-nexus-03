
import React from "react";

interface PriceDisplayProps {
  price: number;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ price }) => {
  if (price <= 0) return null;

  return (
    <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
      <div className="text-sm text-gray-400">Ticket Price</div>
      <div className="text-xl font-bold text-green-400">₹{price}</div>
    </div>
  );
};

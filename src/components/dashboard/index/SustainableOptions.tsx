// SustainableOptions.tsx
"use client"

import React from "react";

const SustainableOptions = () => {
  // Sample sustainable options data
  const sustainableOptions = [
    { id: 1, option: "Recycling Program", description: "Recycle your old appliances for a discount." },
    { id: 2, option: "Trade-In Program", description: "Trade in your old product for store credit." },
    { id: 3, option: "Refurbishing Service", description: "Get your old appliances refurbished and reused." },
  ];

  return (
    <div>
      <h5 className="dash-title-two">Sustainable Product Options</h5>
      <ul className="sustainable-options-list">
        {sustainableOptions.map((item) => (
          <li key={item.id} className="sustainable-option-item">
            <strong>{item.option}:</strong> {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SustainableOptions;

// ProductRecommendations.tsx
"use client"

import React from "react";

const ProductRecommendations = () => {
  // Sample product recommendation data
  const recommendedProducts = [
    { id: 1, name: "4K Ultra HD TV", price: "$799", imageUrl: "/images/products/tv.jpg" },
    { id: 2, name: "Smart Refrigerator", price: "$1,199", imageUrl: "/images/products/refrigerator.jpg" },
    { id: 3, name: "High-Efficiency Washer", price: "$599", imageUrl: "/images/products/washer.jpg" },
  ];

  return (
    <div>
      <ul className="product-list">
        {recommendedProducts.map((product) => (
          <li key={product.id} className="product-item">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-details">
              <h6 className="product-name">{product.name}</h6>
              <span className="product-price">{product.price}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductRecommendations;

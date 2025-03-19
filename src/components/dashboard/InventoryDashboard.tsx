"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { BASE_API_URL } from "@/utils/constants";

export default function InventoryDashboard() {
  const [inventoryData, setInventoryData] = useState([]);
  const [salesData, setSalesData] = useState([]); // State for sales data

  useEffect(() => {
    // Fetch inventory data
    const fetchInventoryData = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}api/get_inventory`);
        setInventoryData(response.data);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    };

    // Fetch sales data
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}api/get_sales_data`); // Update with your sales data endpoint
        setSalesData(response.data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchInventoryData();
    fetchSalesData();
  }, []);

  // Prepare data for the inventory bar chart
  const inventoryChartData = {
    labels: inventoryData.map((item) => item[1]), // product_name
    datasets: [
      {
        label: "Adjusted Stock Levels",
        data: inventoryData.map((item) => item[3]), // adjusted_stock
        backgroundColor: "rgba(75,192,192,0.6)",
      },
      {
        label: "Current Stock Levels",
        data: inventoryData.map((item) => item[2]), // current_stock
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  };

  // Prepare data for the sales bar chart
  const salesChartData = {
    labels: [...new Set(salesData.map((item) => item[2]))], // product_name (unique)
    datasets: [
      {
        label: "Sales Data",
        data: [...new Array(salesData.length).fill(0)], // Initialize an array for sales data
        backgroundColor: "rgba(255,99,132,0.6)", // Different color for clarity
      },
    ],
  };

  // Populate sales data
  salesData.forEach((item) => {
    const productName = item[2]; // product_name
    const sales = item[3]; // sales

    const index = salesChartData.labels.indexOf(productName);
    if (index !== -1) {
      salesChartData.datasets[0].data[index] += sales; // Aggregate sales for the same product
    }
  });

  const options = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { beginAtZero: true },
    },
  };

  return (
    <div>
      {/* <h1>Inventory Dashboard</h1> */}

      {/* Inventory Bar Chart */}
      <h5>Inventory Levels</h5>
      <Bar data={inventoryChartData} options={options} />

      {/* Sales Bar Chart */}
      <h5>Sales Data</h5>
      <Bar data={salesChartData} options={options} />
    </div>
  );
}

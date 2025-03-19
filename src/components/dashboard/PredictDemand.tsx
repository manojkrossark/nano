"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { BASE_API_URL } from "@/utils/constants";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const inventoryResponse = await axios.get(
          `${BASE_API_URL}api/inventory`
        );
        setInventory(inventoryResponse.data); // Set inventory data
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    }
    fetchData();
  }, []);

  const handlePredictDemand = async (product_id, sales, price) => {
    try {
      const response = await axios.post(`${BASE_API_URL}api/predict-demand`, {
        product_id,
        sales,
        price,
      });
      const predictedDemand = response.data.predicted_demand[0];

      // Update predictions in the correct order
      setPredictions((prevPredictions) => {
        const newPredictions = [...prevPredictions];
        const productIndex = inventory.findIndex(
          (item) => item[0] === product_id
        );
        newPredictions[productIndex] = predictedDemand;
        return newPredictions;
      });
    } catch (error) {
      console.error("Error predicting demand:", error);
    }
  };

  const averages = inventory.map((item) => (item[2] + item[3]) / 2);

  // Prepare chart data
  const data = {
    labels: inventory.map((item) => item[1]), // Product Names
    datasets: [
      {
        label: "Average Stock",
        data: averages,
        backgroundColor: "rgba(255, 165, 0, 0.5)",  // Light orange background
        borderColor: "rgba(255, 165, 0, 1)",        // Solid orange border
        
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-body" style={styles.container}>
      <h1 style={styles.title}>Retail Dashboard</h1>
      <div style={styles.chartContainer}>
        {/* Render Bar chart */}
        <Bar data={data} />
      </div>
      <div style={styles.inventoryList}>
        {inventory.map((item) => (
          <div key={item[0]} style={styles.card}>
            <h5 style={styles.productTitle}>{item[1]}</h5> {/* Product name */}
            <ul style={styles.infoList}>
              <li style={styles.infoItem}>
                <span style={styles.greenPoint}></span> Current Stock: {item[2]}
              </li>
              <li style={styles.infoItem}>
                <span style={styles.greenPoint}></span> Adjusted Stock:{" "}
                {item[3]}
              </li>
            </ul>
            <button
              style={styles.button}
              onClick={() => handlePredictDemand(item[0], 100, item[3])}
            >
              Predict Demand
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// CSS-in-JS styles
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#F9F3EF",
    minHeight: "100vh",
  },
  title: {
    textAlign: "center",
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  chartContainer: {
    maxWidth: "700px",
    margin: "0 auto",
    paddingBottom: "20px",
  },
  inventoryList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "40px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  productTitle: {
    fontSize: "1.2rem",
    marginBottom: "10px",
  },
  infoList: {
    listStyleType: "none",
    padding: 0,
    fontSize: "0.9rem",
    marginBottom: "15px",
  },
  infoItem: {
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.85rem",
  },
  greenPoint: {
    width: "8px",
    height: "8px",
    backgroundColor: "#28a745",
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
  },
  button: {
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};

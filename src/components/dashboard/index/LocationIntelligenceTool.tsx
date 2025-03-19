import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import customAxios from "axios";
import { Bar } from "react-chartjs-2"; // Import Chart.js
import { BASE_API_URL } from "@/utils/constants";

const LocationIntelligenceTool = () => {
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [locations, setLocations] = useState([]);
  const [gptRecommendation, setGptRecommendation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted && category && budget) {
      customAxios
        .post(`${BASE_API_URL}api/optimal-locations`, {
          category,
          budget,
        })
        .then((res) => {
          setLocations(res.data.top_locations);
          setGptRecommendation(res.data.gemini_recommendation);
        })
        .catch((error) => {
          console.error("Error fetching optimal locations:", error);
        });
    }
  }, [submitted, category, budget]);

  // Function to create a dynamic icon based on multiple parameters
  const getDynamicMarkerIcon = (location) => {
    let baseColor;
    let sizeModifier = 1; // Default size modifier
    let opacity = 1.0; // Default opacity

    // Base color depending on the score
    if (location.score > 10000) {
      baseColor = "red"; // High score -> Red
    } else if (location.score > 5000) {
      baseColor = "orange"; // Medium score -> Orange
    } else {
      baseColor = "green"; // Low score -> Green
    }

    // Size modification based on traffic score
    if (location.traffic_score > 0.8) {
      sizeModifier = 1.5; // Increase size for high traffic score
    } else if (location.traffic_score < 0.3) {
      sizeModifier = 0.8; // Decrease size for low traffic score
    }

    // Opacity modification based on avg_rent
    if (location.avg_rent > 100000) {
      opacity = 0.5; // Less opaque for high rent
    }

    const iconUrl = `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-${baseColor}.png`;

    return new L.Icon({
      iconUrl,
      iconSize: [25 * sizeModifier, 41 * sizeModifier], // Modify icon size
      iconAnchor: [12 * sizeModifier, 41 * sizeModifier],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
      opacity, // Set opacity
    });
  };

  // Prepare data for the chart
  const chartData = {
    labels: locations.map(
      (loc) => `Lat: ${loc.latitude}, Lon: ${loc.longitude}`
    ),
    datasets: [
      {
        label: "Traffic Score",
        data: locations.map((loc) => loc.traffic_score),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderRecommendation = () => {
    // Convert the recommendation text to a structured format
    const recommendationLines = gptRecommendation
      .split("\n")
      .filter((line) => line.trim() !== "");

    return (
      <ul>
        {recommendationLines.map((line, index) => {
          // Remove all asterisks from the line
          const cleanLine = line.replace(/\*/g, "").trim();

          return <li key={index}>{cleanLine}</li>;
        })}
      </ul>
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label>
          Business Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label style={{ marginTop: "10px" }}>
          Budget:
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <button type="submit" style={{ marginTop: "10px" }}>
          Get Optimal Locations
        </button>
      </form>

      {submitted && (
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {locations.map((loc, index) => (
            <Marker
              key={index}
              position={[loc.latitude, loc.longitude]}
              icon={getDynamicMarkerIcon(loc)}
            >
              <Popup>
                <strong>Location Score:</strong> {loc.score}
                <br />
                <strong>Average Rent:</strong> {loc.avg_rent}
                <br />
                <strong>Traffic Score:</strong> {loc.traffic_score}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {gptRecommendation && (
        <div style={{ marginTop: "20px" }}>
          <h3>GPT-Generated Recommendation:</h3>
          {renderRecommendation()}{" "}
          {/* Render the recommendation in a list format */}
        </div>
      )}

      {locations.length > 0 && (
        <div style={{ marginTop: "20px", width: "600px" }}>
          <h3>Traffic Score Chart</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default LocationIntelligenceTool;

"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { BASE_API_URL } from "@/utils/constants";

// Load custom icons
const userIcon = new L.Icon({
  iconUrl: new URL("./map-pointer.png", import.meta.url).href,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const stationIcon = new L.Icon({
  iconUrl: new URL("./ev-charger-logo.webp", import.meta.url).href,
  iconSize: [60, 60],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const SearchLocation = ({ setCurrentLocation }) => {
  const [search, setSearch] = useState("");
  const map = useMap();

  const handleSearch = async () => {
    if (!search) return;
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: search,
            format: "json",
          },
        }
      );
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCurrentLocation([parseFloat(lat), parseFloat(lon)]);
        map.flyTo([parseFloat(lat), parseFloat(lon)], 12);
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <style>{`
      .allocation-body {
          min-height: 100vh;
          background: #F9F3EF;
          margin-left: 320px;
          padding: 30px 3px 50px;
        }
        .search-bar {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          background: white;
          padding: 5px;
          border-radius: 8px;
          box-shadow: 0px 2px 6px rgba(0,0,0,0.2);
          z-index: 1000;
        }
        .search-bar input {
          border: none;
          padding: 5px;
          width: 200px;
          outline: none;
        }
        .search-bar button {
          background:rgb(255, 123, 0);
          color: white;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 4px;
        }
        .search-bar button:hover {
          background:rgb(179, 66, 0);
        }
      `}</style>
    </div>
  );
};

const EVChargingMap = () => {
  const [evStations, setEvStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState([20.5937, 78.9629]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          fetchEVStations(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  const fetchEVStations = async (lat, lng) => {
    try {
      const response = await axios.get(`${BASE_API_URL}api/get_ev_stations`, {
        params: { latitude: lat, longitude: lng },
      });
      setEvStations(response.data.ev_stations);
    } catch (error) {
      console.error("Error fetching EV stations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="allocation-body">
      <div style={{ textAlign: "center", fontSize: "larger", fontWeight: 500 }}>
        EV Charging Stations Near You
      </div>

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <MapContainer
          center={currentLocation}
          zoom={12}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <SearchLocation setCurrentLocation={setCurrentLocation} />

          {/* User's Current Location Marker */}
          <Marker position={currentLocation} icon={userIcon}>
            <Popup>You're here!</Popup>
          </Marker>

          {/* EV Charging Stations Markers */}
          {evStations?.map((station, index) => (
            <Marker
              key={index}
              position={[station.latitude, station.longitude]}
              icon={stationIcon}
            >
              <Popup>
                <strong>{station.name}</strong> <br />
                <strong>Address:</strong> {station.address} <br />
                <strong>Rating:</strong> {station.rating || "No rating"} ⭐{" "}
                <br />
                <strong>Price Level:</strong> {station.price_level || "N/A"} 💰{" "}
                <br />
                <strong>Latitude:</strong> {station.latitude} <br />
                <strong>Longitude:</strong> {station.longitude}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default EVChargingMap;

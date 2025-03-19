"use client";
import DropdownSeven from "@/components/search-dropdown/home-dropdown/DropdownSeven";
import { useState, useEffect, useRef, Fragment } from "react";
import {
  GoogleMap,
  LoadScriptNext,
  Marker,
  Polyline,
  Autocomplete,
  OverlayView,
} from "@react-google-maps/api";
import axios from "axios";
import { Button } from "@mui/material";
import { BASE_API_URL } from "@/utils/constants";
import Image from "next/image";

import dashboardIcon_1 from "@/assets/images/dashboard/icon/icon_43.svg";
import loadingSpinner from "../../../../public/icons8-loading-48.png";
import refreshIcon from "../../../../public/circular-arrow.png";
const LIBRARIES: "places"[] = ["places"];

const HeroBanner = () => {
  const API_URL = `${BASE_API_URL}api/allocate-charging`;
  const GOOGLE_MAPS_API_KEY = "AIzaSyDAUhNkL--7MVKHtlFuR3acwa7ED-cIoAU";

  const containerStyle = {
    width: "100%",
    height: "500px",
  };
  const greyMapTheme = {
    styles: [
      { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#dadada" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#c9c9c9" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }],
      },
    ],
  };
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [chargingStation, setChargingStation] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 13.0067, // Default: Adyar, Chennai
    lng: 80.2575,
  });
  const [zoom, setZoom] = useState(12);
  const [searchText, setSearchText] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { path: { lat: number; lng: number }[]; color: string }[]
  >([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(userLocation);
        setMapCenter(userLocation);
        setZoom(14);
      },
      (error) => console.error("Error fetching location:", error),
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation); // Update state
          setMapCenter(newLocation); // Move map to new location
          setZoom(14);

          setSearchText("");
          if (autocompleteRef.current) {
            autocompleteRef.current.set("place", null); // Reset Autocomplete
          }
        },
        (error) => {
          console.error("Error fetching location: ", error);
          alert("Unable to fetch location. Please check location permissions.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    if (location) {
      allocateChargingSlot();
    }
  }, [location]);

  const allocateChargingSlot = async () => {
    if (!location) return;
    try {
      setIsLoading(true);
      setAiRecommendation(null);
      const response = await axios.post(API_URL, {
        latitude: location.lat,
        longitude: location.lng,
      });

      console.log("API Response:", response.data);

      setChargingStation(response.data.charging_station);
      setAiRecommendation(response.data.ai_recommendation.recommendation);

      if (response.data.charging_station.location) {
        const [lat, lng] = response.data.charging_station.location
          .split(", ")
          .map(Number);
        setMapCenter({ lat, lng });
        setZoom(14);
      }

      getRoutesToTopStations(
        response.data.ai_recommendation.recommendation.top_3_stations
      );
    } catch (error) {
      console.error("Error fetching charging station:", error);
    } finally {
    }
    setIsLoading(false);
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry) return;
    setSearchText(place?.name);
    const newLocation = {
      lat: place.geometry.location?.lat(),
      lng: place.geometry.location?.lng(),
    };

    setLocation(newLocation);
    setMapCenter(newLocation);
    setZoom(14);
  };

  const getRoutesToTopStations = async (stations: any[]) => {
    if (!location || !stations) return;

    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded yet.");
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const colors = ["#00FF00", "#FFD700", "#FF8C00"]; // Green, Yellow, Orange

    setRouteCoordinates([]); // Reset previous routes

    stations.forEach((station, index) => {
      const [lat, lng] = station.location.split(", ").map(Number);

      directionsService.route(
        {
          origin: location,
          destination: { lat, lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            // ✅ Convert google.maps.LatLng[] to plain { lat, lng }[]
            const path = result.routes[0].overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            }));

            setRouteCoordinates((prevRoutes) => [
              ...prevRoutes,
              { path, color: colors[index] },
            ]);
          } else {
            console.error(
              `Error fetching route for station ${index + 1}:`,
              status
            );
          }
        }
      );
    });
  };
  return (
    <div className="hero-banner-seven position-relative mt-120 lg-mt-100">
      <style>
        {`
          .search-container {
            display: flex;
            align-items: center;
            background-color: white;
            border-radius: 30px;
            border: 1px solid #000; /* Black border */
            padding: 10px 15px;
            width: 100%;
            max-width: 350px; /* Adjust as needed */
          }

          .search-input {
            border: none;
            outline: none;
            background: transparent;
            font-size: 16px;
            flex-grow: 1;
            color: #666; /* Soft text color */
          }

          .search-button {
            background: none;
            border: none;
            cursor: pointer;
          }

          .search-icon {
            width: 20px;
            height: 20px;
            opacity: 0.7;
          }

          .search-wrapper {
            position: absolute;
            top: 20px; /* Adjust spacing */
            right: 20px; /* Aligns to the right */
            display: flex;
            justify-content: flex-end; /* Pushes it to the right */
            width: auto;
            z-index: 1000; /* Ensures it stays above the map */
          }

          .search-icon, .loading-icon {
            width: 20px; /* Ensure size is proper */
            height: 20px;
            display: block; /* Ensure it's visible */
          }

          .refresh-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.refresh-icon {
  width: 22px;
  height: 22px;
  opacity: 0.7;
}

.refresh-button:hover .refresh-icon {
  opacity: 1;
  transform: rotate(180deg);
  transition: 0.3s;
}

          .loading-icon {
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .search-wrapper {
          left: 50%;
          transform: translateX(-50%);
          right: auto;
          width: 90%; /* Ensures it's wide enough */
          max-width: 350px; /* Adjust if needed */
  }
          }
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it stays on top */
}

/* Pulsating Effect for the EV Charger Logo */
.ev-charger-loader {
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.5; } /* Dim */
  100% { opacity: 1; } /* Bright */
}

/* Loading text */
.loading-text {
  margin-top: 15px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
        `}
      </style>
      {isLoading && (
        <div className="loading-overlay">
          <Image
            src="/ev-charger-logo.webp"
            alt="EV Charging"
            className="ev-charger-loader"
            width={80}
            height={80}
          />
          <p className="loading-text">Fetching data, please wait...</p>
        </div>
      )}
      <div id="" className="h-100">
        <div
          className="google-map-home"
          id="contact-google-map"
          data-map-lat="40.925372"
          data-map-lng="-74.276544"
          data-icon-path="/assetes/images/home2/map-icon.png"
          data-map-title="Awesome Place"
          data-map-zoom="12"
        ></div>
        <div className="p-6 flex flex-col gap-6 w-100 h-100">
          <LoadScriptNext
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={LIBRARIES}
          >
            <>
              <div className="search-wrapper">
                <Autocomplete
                  onLoad={(auto) => (autocompleteRef.current = auto)}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search here.."
                      className="search-input"
                      value={searchText} // Bind state
                      onChange={(e) => setSearchText(e.target.value)}
                    />

                    <button type="submit" className="search-button">
                      {isLoading ? (
                        <Image
                          src={loadingSpinner}
                          alt="Loading..."
                          className="loading-icon"
                        />
                      ) : (
                        <Image
                          src={dashboardIcon_1}
                          alt="Search Icon"
                          className="search-icon"
                        />
                      )}
                    </button>
                  </div>
                </Autocomplete>
                <button
                  type="button"
                  className="refresh-button"
                  onClick={fetchCurrentLocation}
                  title="Refresh Location"
                >
                  <Image
                    src={refreshIcon}
                    alt="Refresh"
                    className="refresh-icon"
                  />
                </button>
              </div>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                // mapTypeId="roadmap"
                options={{
                  ...greyMapTheme,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
                zoom={zoom}
              >
                {/* User Location Marker */}
                {location && (
                  <Marker
                    position={location}
                    // label="You"
                    icon={{
                      url: "/Navigator.png",
                      scaledSize: { width: 30, height: 30 } as any,
                    }}
                  />
                )}

                {aiRecommendation?.top_3_stations?.length > 0 &&
                  aiRecommendation.top_3_stations.map((station, index) => {
                    const [lat, lng] = station.location.split(", ").map(Number);

                    return (
                      <Fragment key={index}>
                        {/* Marker with custom numbered circle */}
                        <Marker
                          position={{ lat, lng }}
                          icon={{
                            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                    <circle cx="20" cy="20" r="16" fill="black" stroke="white" stroke-width="2"/>
                    <text x="50%" y="55%" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
                      ${index + 1}
                    </text>
                  </svg>
                `)}`,
                            scaledSize: { width: 30, height: 30 } as any,
                          }}
                          onClick={() => setSelectedStation(station)}
                        />

                        {/* Custom Tooltip with OverlayView */}
                        {selectedStation?.location === station.location && (
                          <OverlayView
                            position={{ lat, lng }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                          >
                            <div
                              style={{
                                position: "relative",
                                transform: "translate(-50%, -120%)",
                              }}
                            >
                              {/* Tooltip Box */}
                              <div
                                style={{
                                  backgroundColor: "white",
                                  color: "black",
                                  padding: "8px 14px",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  // borderRadius: "20px",
                                  boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                                  whiteSpace: "nowrap",
                                  display: "inline-block",
                                  textAlign: "center",
                                }}
                              >
                                {station.name
                                  .replace(/Charging Station/gi, "")
                                  .trim()}
                              </div>

                              {/* Connector Line */}
                              <div
                                style={{
                                  width: "2px",
                                  height: "12px",
                                  backgroundColor: "black",
                                  position: "absolute",
                                  left: "50%",
                                  top: "100%",
                                  transform: "translateX(-50%)",
                                }}
                              ></div>
                            </div>
                          </OverlayView>
                        )}
                      </Fragment>
                    );
                  })}

                {/* Render Plotted Routes */}
                {routeCoordinates.map((route, index) => (
                  <Polyline
                    key={index}
                    path={route.path}
                    options={{
                      strokeOpacity: 1, // Hide solid line
                      strokeWeight: 4,
                      // icons: [
                      //   {
                      //     icon: {
                      //       path: "M 0,-1.5 L 0,1.5", // Small dash segment
                      //       strokeOpacity: 1,
                      //       scale: 3, // Dash thickness
                      //       strokeColor: "black",
                      //     },
                      //     offset: "0",
                      //     repeat: "10px", // Increase for larger gaps
                      //   },
                      // ],
                    }}
                  />
                ))}
              </GoogleMap>
            </>
          </LoadScriptNext>
        </div>
      </div>

      <div className="search-wrapper-overlay">
        <div className="container container-large">
          <div className="position-relative">
            <div className="row">
              <div className="col-12">
                <div
                  style={{
                    width: "100%",
                    overflowX: "auto",
                    padding: "20px",
                  }}
                >
                  <div className="flex flex-row justify-center items-center gap-4 mt-4">
                    <button className="bg-black text-white rounded-full p-3 shadow-md hover:bg-gray-800 transition">
                      <i className="bi bi-cloud-rain text-lg"></i>
                    </button>
                    <button className="bg-black text-white rounded-full p-3 shadow-md hover:bg-gray-800 transition">
                      <i className="bi bi-lightning text-lg"></i>
                    </button>
                    <button className="bg-black text-white rounded-full p-3 shadow-md hover:bg-gray-800 transition">
                      <i className="bi bi-sun text-lg"></i>
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "15px" }}>
                    {/* AI Recommendation */}
                    {!isLoading && aiRecommendation && (
                      <div
                        style={{
                          position: "relative", // To allow positioning for the temperature badge
                          width: "250px",
                          minWidth: "250px",
                          padding: "15px",
                          border: "1px solid #ccc",
                          borderRadius: "10px",
                          background: "#fff",
                          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {/* Weather Badge */}
                        {aiRecommendation?.weather?.temperature && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-18px",
                              backgroundColor: "black",
                              color: "white",
                              padding: "5px 10px",
                              borderRadius: "20px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                            }}
                          >
                            <span style={{ fontSize: "16px" }}>🌤</span>
                            {aiRecommendation.weather.temperature}°C
                          </div>
                        )}
                        <h5
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "black",
                          }}
                        >
                          🤖 Alto Recommends
                        </h5>
                        <p style={{ fontSize: "14px", color: "#333" }}>
                          ⏳ Best Time:{" "}
                          <span style={{ fontWeight: "bold", color: "black" }}>
                            {aiRecommendation?.best_time_to_charge}
                          </span>
                        </p>
                        <p style={{ fontSize: "14px", color: "#333" }}>
                          🚦 Peak Hours:{" "}
                          <span style={{ fontWeight: "bold", color: "black" }}>
                            {aiRecommendation?.peak_hours?.join(", ")}
                          </span>
                        </p>
                      </div>
                    )}

                    {!isLoading &&
                      aiRecommendation?.top_3_stations?.map(
                        (station, index) => (
                          <div
                            key={index}
                            style={{
                              position: "relative", // Enables positioning for the index circle
                              width: "250px",
                              minWidth: "250px",
                              padding: "15px",
                              border: "1px solid #ccc",
                              borderRadius: "10px",
                              background: "#fff",
                              boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
                              textAlign: "center",
                            }}
                          >
                            {/* Numbered Circle */}
                            <div
                              style={{
                                position: "absolute",
                                top: "-15px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor: "black",
                                color: "white",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                              }}
                            >
                              {index + 1}
                            </div>

                            {/* Station Info */}
                            <h6
                              style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "black",
                                marginTop: "10px",
                              }}
                            >
                              {station.name
                                .replace(/Charging Station/gi, "")
                                .trim()}
                            </h6>
                            <p style={{ fontSize: "14px", color: "#333" }}>
                              📍 Location: {station.address}
                            </p>
                            <p style={{ fontSize: "14px", color: "#333" }}>
                              💰 Price per kWh: ₹{station.price_per_kwh}
                            </p>
                            <p style={{ fontSize: "14px", color: "#333" }}>
                              🚗 Distance: {station.user_distance_km} km
                            </p>
                            <p style={{ fontSize: "14px", color: "#333" }}>
                              ⏳ Travel Time:{" "}
                              {station.estimated_travel_time_min} mins
                            </p>
                            <p style={{ fontSize: "14px", color: "#333" }}>
                              ⚡ Cost for 10kWh: ₹
                              {station.estimated_cost_for_10kWh}
                            </p>
                          </div>
                        )
                      )}
                    {/* </div> */}

                    {/* Weather Conditions */}
                    {/* {aiRecommendation?.weather && (
                      <div
                        style={{
                          width: "250px",
                          minWidth: "250px",
                          padding: "15px",
                          border: "1px solid #ccc",
                          borderRadius: "10px",
                          background: "#fff",
                          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <h5
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "black",
                          }}
                        >
                          🌤 Weather
                        </h5>
                        <p style={{ fontSize: "14px", color: "#333" }}>
                          🌡 Temperature: {aiRecommendation.weather.temperature}
                          °C
                        </p>
                        <p style={{ fontSize: "14px", color: "#333" }}>
                          💨 Wind: {aiRecommendation.weather.wind_speed} km/h
                        </p>
                        <p style={{ fontSize: "14px", color: "#333" }}>
                          💧 Humidity: {aiRecommendation.weather.humidity}%
                        </p>
                        <p style={{ fontSize: "14px", color: "#333" }}>
                          ☀️ Condition: {aiRecommendation.weather.condition}
                        </p>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

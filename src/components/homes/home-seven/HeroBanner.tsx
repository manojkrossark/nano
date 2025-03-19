"use client";
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
import { BASE_API_URL } from "@/utils/constants";
import Image from "next/image";

import dashboardIcon_1 from "@/assets/images/dashboard/icon/icon_43.svg";
import loadingSpinner from "../../../../public/icons8-loading-48.png";

const LIBRARIES: "places"[] = ["places"];

const HeroBanner = () => {
  const API_URL = `${BASE_API_URL}api/allocate-charging`;
  const API_URL_EV = `${BASE_API_URL}api/allocate-charging`;
  const API_URL_PETROL = `${BASE_API_URL}api/allocate-fuel`;
  const GOOGLE_MAPS_API_KEY = "AIzaSyDAUhNkL--7MVKHtlFuR3acwa7ED-cIoAU";

  const containerStyle = {
    width: "100%",
    height: "100%",
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
    lat: 13.0067,
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
  const [selectedStationType, setSelectedStationType] = useState("petrol");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");

  const handleStationTypeChange = (type) => {
    setSelectedStationType(type);
  };

  useEffect(() => {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (permission.state === "granted") {
          requestLocation();
        } else {
          setShowPopup(true);
        }
      })
      .catch(() => setShowPopup(true));
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(userLocation);
        setMapCenter(userLocation);
        setZoom(14);
        setShowPopup(false);
      },
      (error) => {
        setError(
          "Location access denied. Please allow location in browser settings."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  useEffect(() => {
    if (location) {
      allocateStation();
    }
  }, [location, selectedStationType]);

  const allocateStation = async () => {
    if (!location) return;

    const API_URL = selectedStationType === "ev" ? API_URL_EV : API_URL_PETROL;

    try {
      setIsLoading(true);
      setAiRecommendation(null);

      const response = await axios.post(API_URL, {
        latitude: location.lat,
        longitude: location.lng,
      });

      console.log("API Response:", response.data);

      setChargingStation(response.data.station); // Now generic for EV & Petrol
      setAiRecommendation(response.data.ai_recommendation.recommendation);

      if (response.data.station.location) {
        const [lat, lng] = response.data.station.location
          .split(", ")
          .map(Number);
        setMapCenter({ lat, lng });
        setZoom(14);
      }

      getRoutesToTopStations(
        response.data.ai_recommendation.recommendation.top_3_stations
      );
    } catch (error) {
      console.error("Error fetching station:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogleMaps = (stationLocation) => {
    if (!location) {
      alert("Please enable location access to get directions.");
      return;
    }

    const userLat = location.lat;
    const userLng = location.lng;

    const [stationLat, stationLng] = stationLocation?.split(",").map(Number);

    const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${stationLat},${stationLng}`;

    window.open(googleMapsUrl, "_blank");
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
    <div className="hero-banner-seven position-relative">
      {isLoading && (
        <div className="loading-overlay">
          <Image
            src="/Charging Stations.png"
            alt="EV Charging"
            className="ev-charger-loader"
            width={40}
            height={40}
          />
          <p className="loading-text">Fetching your location, please wait...</p>
        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h5>Location Permission Needed</h5>
            <p>
              This app requires access to your location to function properly.
            </p>
            <button onClick={requestLocation} style={{ margin: "auto" }}>
              Allow Location
            </button>
            {error && <p className="error">{error}</p>}
          </div>
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
              <div className="station-selection">
                <div className="station-toggle">
                  <button
                    className={`toggle-button ${
                      selectedStationType === "ev" ? "active" : ""
                    }`}
                    onClick={() => handleStationTypeChange("ev")}
                    title="EV Charging Stations"
                  >
                    <i className="fa-solid fa-charging-station"></i>
                  </button>

                  <button
                    className={`toggle-button ${
                      selectedStationType === "petrol" ? "active" : ""
                    }`}
                    onClick={() => handleStationTypeChange("petrol")}
                    title="Petrol Stations"
                  >
                    <i className="fa-solid fa-gas-pump"></i>
                  </button>
                </div>
              </div>
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
                      value={searchText}
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
              </div>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
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
                  <div style={{ display: "flex", gap: "15px" }}>
                    {aiRecommendation?.weather?.temperature && (
                      <>
                        <div
                          className="flex justify-center mt-4"
                          style={{
                            backgroundColor: "black",
                            color: "white",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginBottom: "30px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                          }}
                        >
                          <button className="btn btn-dark btn-sm rounded-pill d-flex align-items-center fw-bold">
                            🌤 {aiRecommendation.weather.temperature}°C
                          </button>
                        </div>
                        <div
                          className="flex justify-center mt-4"
                          style={{
                            backgroundColor: "#ff6725",
                            color: "white",
                            fontWeight: "bold",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginBottom: "30px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                          }}
                        >
                          <button className="btn btn-sm rounded-pill d-flex align-items-center fw-bold text-white">
                            <i
                              className="bi bi-battery-half"
                              style={{ fontWeight: "bold", fontSize: "25px" }}
                              aria-hidden="true"
                            ></i>
                            &nbsp;70%
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "15px" }}>
                    {!isLoading && aiRecommendation && (
                      <div
                        style={{
                          position: "relative",
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
                          🤖 Alto Recommends
                        </h5>

                        {(aiRecommendation.best_time_to_charge ||
                          aiRecommendation.best_time_to_refuel) && (
                          <>
                            <p style={{ fontSize: "14px", color: "#333" }}>
                              ⏳ Best Time:{" "}
                              <span
                                style={{ fontWeight: "bold", color: "black" }}
                              >
                                {aiRecommendation.best_time_to_charge ||
                                  aiRecommendation.best_time_to_refuel}
                              </span>
                            </p>
                            <p style={{ fontSize: "14px", color: "#333" }}>
                              🚦 Peak Hours:{" "}
                              <span
                                style={{ fontWeight: "bold", color: "black" }}
                              >
                                {aiRecommendation.peak_hours?.join(", ") ||
                                  "N/A"}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {!isLoading &&
                      aiRecommendation?.top_3_stations?.map(
                        (station, index) => (
                          <div
                            key={index}
                            style={{
                              position: "relative",
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
                                fontSize: "16px",
                                fontWeight: "bold",
                                boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                              }}
                            >
                              {index + 1}
                            </div>

                            {/* Station Name */}
                            <h6
                              style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "black",
                                marginTop: "10px",
                              }}
                            >
                              {station.name
                                .replace(
                                  /(Charging Station|Petrol Pump|CNG Station)/gi,
                                  ""
                                )
                                .trim()}
                            </h6>

                            <p style={{ fontSize: "11px", color: "#333" }}>
                              📍 {station.address}
                            </p>

                            {station.price_per_kwh ? (
                              <p
                                style={{
                                  fontSize: "16px",
                                  color: "#333",
                                  fontWeight: "bold",
                                }}
                              >
                                ⛽ ₹{station.price_per_kwh}/kWh
                              </p>
                            ) : (
                              <p
                                style={{
                                  fontSize: "16px",
                                  color: "#333",
                                  fontWeight: "bold",
                                }}
                              >
                                ⛽ ₹{station.fuel_price_per_litre}/L
                              </p>
                            )}

                            <p
                              style={{
                                fontSize: "11px",
                                color: "#333",
                                lineHeight: "1rem",
                              }}
                            >
                              <b>
                                <i className="bi bi-geo-alt"></i>
                              </b>
                              Distance: {station.user_distance_km} km
                            </p>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#333",
                                lineHeight: "1rem",
                              }}
                            >
                              <b>
                                <i className="bi bi-alarm"></i>
                              </b>{" "}
                              Travel Time: {station.estimated_travel_time_min}{" "}
                              mins
                            </p>
                            <div
                              style={{
                                position: "absolute",
                                bottom: "10px",
                                right: "10px",
                                cursor: "pointer",
                              }}
                              onClick={() => openGoogleMaps(station.location)}
                            >
                              <i
                                className="fa-light fa-diamond-turn-right"
                                style={{
                                  fontSize: "20px",
                                  backgroundColor: "#FF6725",
                                  padding: "10px",
                                  borderRadius: "20px",
                                  color: "#fff",
                                }}
                              ></i>
                            </div>
                          </div>
                        )
                      )}
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

"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Down arrow icon
import ExpandLessIcon from "@mui/icons-material/ExpandLess"; // Up arrow icon
import { BASE_API_URL } from "@/utils/constants";

const DeliveryScheduler = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [userLocation, setUserLocation] = useState("default location"); // Could use geolocation
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [error, setError] = useState(""); // Error state
  const [isExpanded, setIsExpanded] = useState(false); // State for expand

  useEffect(() => {
    fetchAvailableSlots();
  }, [userLocation]); // Fetch slots based on user location

  // Fetch available slots from the backend
  const fetchAvailableSlots = async () => {
    setIsLoading(true); // Start loader
    setError(""); // Clear previous errors
    try {
      const response = await axios.get(`${BASE_API_URL}api/available-slots`, {
        params: { location: userLocation },
      });
      setTimeSlots(response.data.available_slots);
      setRecommendedSlots(response.data.recommended_slots);
    } catch (error) {
      setError("Error fetching available slots. Please try again later.");
      console.error("Error fetching available slots:", error);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  // Handle slot reservation
  const handleReserveSlot = async (slotId) => {
    setIsLoading(true); // Start loader
    setError(""); // Clear previous errors
    try {
      const response = await axios.post(`${BASE_API_URL}api/reserve-slot`, {
        slot_id: slotId,
      });
      alert(response.data.message);
      fetchAvailableSlots(); // Refresh the slots
    } catch (error) {
      setError("Error reserving the slot. Please try again later.");
      console.error("Error reserving slot:", error);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded); // Toggle expand state
  };

  // Determine the slots to display (first 6 or all depending on expand state)
  const slotsToShow = isExpanded ? timeSlots : timeSlots.slice(0, 6);

  return (
    <div style={{ paddingLeft: "20px" }}>
      <h5>Available Delivery Slots</h5>

      {isLoading ? (
        <p>Loading available slots...</p> // Loader message
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p> // Error message
      ) : (
        <div className="email-read-panel">
          {slotsToShow?.map((slot, index) => (
            <div
              key={index}
              className="email-list-item ps-3 pe-3 ps-xxl-4 pe-xxl-4 d-flex justify-content-between align-items-center"
            >
              <div className="email-short-preview">
                <div className="d-flex align-items-center">
                  <div className="sender-name" style={{ fontSize: "small" }}>
                    Slot {index + 1}
                  </div>
                </div>
                <div className="mail-sub" style={{ fontSize: "small" }}>
                  {slot[1]} {slot[2]}
                </div>
              </div>
              <Button
                variant="contained"
                onClick={() => handleReserveSlot(slot[0])}
                style={{
                  marginLeft: "auto",
                  background: "#000",
                  color: "#fff",
                }} // Align button to the right
              >
                Reserve
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Expand/collapse icon logic */}
      {timeSlots.length > 6 && (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <IconButton onClick={handleExpandClick}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>
      )}

      <h5>Recommended Time Slots</h5>
      {Array.isArray(recommendedSlots) && recommendedSlots?.length > 0 ? (
        <Typography>{recommendedSlots?.join(", ")}</Typography>
      ) : (
        <Typography>No recommended slots available</Typography>
      )}
    </div>
  );
};

export default DeliveryScheduler;

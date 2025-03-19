// @ts-ignore
import { useState, useEffect } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css"; // Import MapLibre CSS

const DemandMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 10,
    width: "100%",
    height: "400px",
  });

  const [mapLib, setMapLib] = useState<any>(null); // Use 'any' for flexibility

  const demandLocations = [
    { lat: 37.7749, lng: -122.4194 },
    { lat: 37.7849, lng: -122.4294 },
  ];

  // Load maplibre-gl library on component mount
  useEffect(() => {
    const loadMapLib = async () => {
      const lib = await import("maplibre-gl");
      setMapLib(lib.default); // Set the default export of the library
    };

    loadMapLib();
  }, []);

  if (!mapLib) {
    return <div>Loading map...</div>; // Optional loading state
  }

  return (
    <ReactMapGL
      {...viewport}
      mapLib={mapLib} // Pass the loaded maplibre-gl library
      mapStyle="https://api.maptiler.com/maps/streets/style.json?key=MlvW39xk4zFQvgxZOYQr"
    >
      {demandLocations.map((loc, index) => (
        <Marker key={index} latitude={loc.lat} longitude={loc.lng}>
          <div
            style={{
              backgroundColor: "red",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
            }}
          />
        </Marker>
      ))}
    </ReactMapGL>
  );
};

export default DemandMap;

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "leaflet/dist/leaflet.css";
import L, { Map as LeafletMap } from "leaflet";

type Store = {
  store_id: string;
  location_x: number;
  location_y: number;
  inventory: number;
  brand: string;
  demand: number;
};

type Reallocation = {
  from_store: string;
  to_store: string;
};

const createInventoryPinIcon = (
  inventory: number,
  brand: string,
  isHovered: boolean
) => {
  let color: string;
  let iconLabel: string;

  if (inventory > 150) {
    color = "red";
    iconLabel = "High";
  } else if (inventory > 100) {
    color = "orange";
    iconLabel = "Medium";
  } else if (inventory > 50) {
    color = "yellow";
    iconLabel = "Low";
  } else {
    color = "green";
    iconLabel = "Critical";
  }

  const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column;">
            <span style="font-size: 12px; font-weight: bold; background-color: white; padding: 2px 5px; border-radius: 5px; margin-bottom: -10px;">
                ${inventory} Units
            </span>
            <svg width="40" height="60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:black;stop-opacity:1" />
                    </radialGradient>
                </defs>
                <circle cx="20" cy="10" r="10" fill="url(#grad1)" stroke="#fff" stroke-width="2"/>
                <path d="M10,20 Q20,40 30,20" fill="url(#grad1)" stroke="#fff" stroke-width="2" />
                <text x="50%" y="30%" text-anchor="middle" fill="white" font-size="10px" dy=".3em">${iconLabel}</text>
            </svg>
            <div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);">
                <span style="font-weight: bold; background-color: white; padding: 2px 5px; border-radius: 5px;">${brand}</span>
            </div>
        </div>
    `;

  return L.divIcon({
    className: "custom-pin-icon",
    html: iconHtml,
    iconSize: [40, 60],
    iconAnchor: [20, 60],
  });
};

const Map: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [reallocations, setReallocations] = useState<Reallocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [hoveredStore, setHoveredStore] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/stores"); // Replace with your actual API endpoint
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };
    fetchStores();
  }, []);

  const triggerReallocation = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reallocate_stock"
      );
      setReallocations(response.data);
      response.data.forEach((reallocation: Reallocation) => {
        const fromStore = stores.find(
          (s) => s.store_id === reallocation.from_store
        );
        const toStore = stores.find(
          (s) => s.store_id === reallocation.to_store
        );
        if (fromStore && toStore) animateFlow(fromStore, toStore);
      });
    } catch (error) {
      console.error("Error during reallocation:", error);
    }
  };

  const animateFlow = (fromStore: Store, toStore: Store) => {
    const flow = L.polyline(
      [
        [fromStore.location_x, fromStore.location_y],
        [toStore.location_x, toStore.location_y],
      ],
      { color: "blue", weight: 4 }
    ).addTo(mapRef.current as LeafletMap);

    const startPoint = flow.getLatLngs()[0];
    const endPoint = flow.getLatLngs()[1];

    let marker = L.circleMarker(startPoint, {
      color: "blue",
      radius: 5,
      fillOpacity: 0.5,
    }).addTo(mapRef.current as LeafletMap);

    const duration = 2000;
    const steps = 100;
    let step = 0;

    const animate = () => {
      if (step <= steps) {
        const lat =
          startPoint.lat + (endPoint.lat - startPoint.lat) * (step / steps);
        const lng =
          startPoint.lng + (endPoint.lng - startPoint.lng) * (step / steps);
        marker.setLatLng([lat, lng]);
        step++;
        requestAnimationFrame(animate);
      } else {
        marker.remove();
      }
    };
    animate();
  };

  return (
    <div>
      {/* <h1>Stock Reallocation Map</h1> */}
      <button onClick={triggerReallocation}>Trigger Stock Reallocation</button>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "500px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {stores.map((store) => (
          <Marker
            key={store.store_id}
            position={[store.location_x, store.location_y]}
            eventHandlers={{
              click: () => setSelectedStore(store),
              mouseover: () => setHoveredStore(store.store_id),
              mouseout: () => setHoveredStore(null),
            }}
            icon={createInventoryPinIcon(
              store.inventory,
              store.brand,
              hoveredStore === store.store_id
            )}
          >
            <Popup>
              Store ID: {store.store_id} <br />
              Inventory: {store.inventory} <br />
              Brand: {store.brand} <br />
              Demand: {store.demand}
            </Popup>
          </Marker>
        ))}

        {reallocations.map((reallocation, index) => (
          <Polyline
            key={index}
            positions={[
              [
                stores.find((s) => s.store_id === reallocation.from_store)
                  ?.location_x || 0,
                stores.find((s) => s.store_id === reallocation.from_store)
                  ?.location_y || 0,
              ],
              [
                stores.find((s) => s.store_id === reallocation.to_store)
                  ?.location_x || 0,
                stores.find((s) => s.store_id === reallocation.to_store)
                  ?.location_y || 0,
              ],
            ]}
            color="blue"
          />
        ))}
      </MapContainer>

      {selectedStore && (
        <div style={{ marginTop: "20px" }}>
          <h2>Store {selectedStore.store_id} Statistics</h2>
          <LineChart width={500} height={300} data={[selectedStore]}>
            <Line type="monotone" dataKey="inventory" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="store_id" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default Map;

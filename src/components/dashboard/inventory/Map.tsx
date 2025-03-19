"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
import L from "leaflet";
import "leaflet-polylinedecorator";
import { BASE_API_URL } from "@/utils/constants";
import Modal from "react-modal";
import { getBrandIcon } from "./BrandIcons";
import { decode } from "@googlemaps/polyline-codec";
import "leaflet-arrowheads"; //

const indiaBounds = [
  [6.5546, 68.1114], // Southwest corner of India
  [35.6745, 97.3956], // Northeast corner of India
];
// Helper function for generating innovative 3D-like custom icons with hover effect
const createCustomIcon = (
  inventory: number,
  brand: string,
  isHovered: boolean
) => {
  let color: string;
  let iconLabel: string;

  if (inventory > 150) {
    color = "#ff5c5c"; // Red for high
    iconLabel = "High";
  } else if (inventory > 100) {
    color = "#ff9f43"; // Orange for medium
    iconLabel = "Medium";
  } else if (inventory > 50) {
    color = "#ffde5c"; // Yellow for low
    iconLabel = "Low";
  } else {
    color = "#5cd65c"; // Green for critical
    iconLabel = "Critical";
  }

  const iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column;">
              <span style="font-size: 14px; font-weight: bold; background-color: white; padding: 2px 5px; border-radius: 5px; margin-bottom: -10px;">
                  ${inventory}
              </span>
              <svg width="40" height="60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="10" fill="${color}" stroke="black" stroke-width="2"/>
              </svg>
          </div>
      `;

  return L.divIcon({
    className: "custom-pin-icon",
    html: iconHtml,
    iconSize: [40, 60],
    iconAnchor: [20, 60],
  });
};

// Define store and reallocation types
interface Store {
  store_id: number;
  location_x: number;
  location_y: number;
  inventory: number;
  brand: string;
  demand: number;
  store_name: string;
}

interface Reallocation {
  from_store: number;
  to_store: number;
  brand: string;
  amount: number;
  profit: number;
}

const Map = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [reallocations, setReallocations] = useState<Reallocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [hoveredStore, setHoveredStore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [plotRoutes, setPlotRoutes] = useState(false);
  const mapRef = useRef(null);
  const arrowMarkers = useRef([]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}api/stores`);
        // const evStation = await axios.get(`${BASE_API_URL}api/get_ev_stations`);
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const createArrowMarker = (fromStore: Store, toStore: Store) => {
    const latlngs = [
      [fromStore.location_x, fromStore.location_y],
      [toStore.location_x, toStore.location_y],
    ];

    const line = L.polyline(latlngs, {
      color: "darkblue",
      weight: 4,
      dashArray: "5, 5", // Dotted line
    }).addTo(mapRef.current!);

    const arrowHead = L.polylineDecorator(line, {
      patterns: [
        {
          offset: "100%",
          repeat: 0,
          symbol: L.Symbol.arrowHead({
            pixelSize: 15,
            pathOptions: { fillOpacity: 1, color: "darkblue", weight: 2 },
          }),
        },
      ],
    }).addTo(mapRef.current!);

    arrowMarkers.current.push({ line, arrowHead });
  };

  const openModal = (store) => {
    setSelectedStore(store);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedStore(null);
  };

  const clearArrowMarkers = () => {
    arrowMarkers.current.forEach(({ line, arrowHead }) => {
      if (mapRef.current) {
        mapRef.current.removeLayer(line);
        mapRef.current.removeLayer(arrowHead);
      }
    });
    arrowMarkers.current = [];
  };

  const triggerReallocation = async () => {
    setLoading(true);
    setPlotRoutes(false);
    clearArrowMarkers();
    try {
      const response = await axios.post(`${BASE_API_URL}api/reallocate_stock`);
      setReallocations(response.data);

      response.data.forEach((reallocation: Reallocation) => {
        const fromStore = stores.find(
          (s) => s.store_id === reallocation.from_store
        );
        const toStore = stores.find(
          (s) => s.store_id === reallocation.to_store
        );
        if (fromStore && toStore) {
          createArrowMarker(fromStore, toStore); // Create arrow marker between stores
        }
      });
    } catch (error) {
      console.error("Error during reallocation:", error);
    } finally {
      setLoading(false);
    }
  };

  const plotReallocationRoutes = () => {
    setPlotRoutes(true);
    clearArrowMarkers();
    let index = 1;
    reallocations.forEach((reallocation) => {
      const fromStore = stores.find(
        (s) => s.store_id === reallocation.from_store
      );
      const toStore = stores.find((s) => s.store_id === reallocation.to_store);
      if (fromStore && toStore && reallocation.route_polyline) {
        index++;
        const routeCoordinates = decode(reallocation.route_polyline);
        L.polyline(routeCoordinates, {
          color: "#010",
          dashArray: "5, 10",
        })
          .addTo(mapRef.current)
          .arrowheads({
            size: "12px",
            frequency: "end",
            fill: true,
          });
      }
    });
  };

  const plotSingleRoute = (polyline, orderNumber) => {
    if (polyline) {
      clearArrowMarkers();
      const routeCoordinates = decode(polyline);
      L.polyline(routeCoordinates, {
        color: "#010",
        dashArray: "5, 10",
      })
        .addTo(mapRef.current)
        .arrowheads({
          size: "12px",
          frequency: "end",
          fill: true,
        });

      // Create a custom circle with order number
      const orderCircle = L.divIcon({
        className: "order-circle",
        html: `
          <div style="
            background-color: #010; 
            color: white; 
            border-radius: 50%; 
            width: 30px; 
            height: 30px; 
            display: flex; 
            align-items: center; 
            position:fixed;
            justify-content: center; 
            font-weight: bold;
            top: 15px;
          ">
            ${orderNumber}
          </div>
        `,
        iconSize: [30, 30], // Size of the custom circle
        iconAnchor: [20, 20], // Center the icon
      });

      // Add the custom order circle to the map at the starting point of the route
      L.marker(routeCoordinates[0], { icon: orderCircle }).addTo(
        mapRef.current
      );
    }
  };

  return (
    <div className="allocation-body">
      <style>
        {`
        .allocation-body {
          min-height: 100vh;
          background: #F9F3EF;
          margin-left: 320px;
          padding: 30px 3px 50px;
        }
  
        .spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
        }
  
        .dashboard {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          margin-top: 20px;
        }
  
        .tile {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 15px;
          margin: 10px;
          width: calc(33% - 20px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
  
        .ReactModal__Overlay {
          background-color: rgba(0, 0, 0, 0.75);
        }
  
        .ReactModal__Content {
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          transform: translate(-50%, -50%);
          width: 80%;
          max-width: 600px;
          padding: 20px;
          border-radius: 10px;
          background-color: white;
        }
  
        button {
          margin: 10px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          border-radius: 5px;
          background-color: #007bff;
          color: white;
          transition: background-color 0.3s;
        }
  
        button:hover {
          background-color: #0056b3;
        }
  
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        `}
      </style>
      <div className="position-relative">
        <h5>Stock Reallocation Map</h5>

        {/* Trigger Reallocation Button */}
        <button
          onClick={triggerReallocation}
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            backgroundColor: "#010",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          {loading ? "Processing..." : "Trigger Stock Reallocation"}
        </button>

        {/* Plot Routes Button */}
        <button
          onClick={plotReallocationRoutes}
          disabled={plotRoutes || loading || reallocations.length === 0}
          style={{
            position: "fixed",
            top: "60px",
            right: "10px",
            backgroundColor: plotRoutes ? "gray" : "#010",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: plotRoutes ? "not-allowed" : "pointer",
            zIndex: 1000,
          }}
        >
          {plotRoutes ? "Routes Plotted" : "Plot Routes"}
        </button>

        {/* MapContainer */}
        <MapContainer
          center={[20.5937, 78.9629]} // Center on India
          zoom={5}
          style={{ height: "630px", width: "100%" }}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          ref={mapRef}
        >
          {/* <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          /> */}
          /{" "}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {/* Markers for Stores */}
          {Array.isArray(stores) &&
            stores.map((store) => {
              const storeReallocations = reallocations.filter(
                (reallocation) => reallocation.to_store === store.store_id
              );

              return (
                <Marker
                  key={store.store_id}
                  position={[store.location_x, store.location_y]}
                  icon={createCustomIcon(store.inventory)}
                >
                  <Popup>
                    <strong>Store:</strong> {store.store_name} <br />
                    <strong>Brand:</strong> {store.brand} <br />
                    <strong>Inventory:</strong> {store.inventory} <br />
                    <strong>Demand:</strong> {store.demand} <br />
                    <strong>Reallocation Recommendations:</strong>
                    {storeReallocations.length > 0 ? (
                      <ul>
                        {storeReallocations.map((reallocation, index) => (
                          <li key={index}>
                            {reallocation.from_store === store.store_id
                              ? `Send ${reallocation.amount} units of ${reallocation.brand} to Store ${reallocation.to_store}`
                              : `Receive ${reallocation.amount} units of ${reallocation.brand} from Store ${reallocation.from_store}`}
                            <br />
                            {/* <strong>Transport Cost:</strong> ₹
                            {reallocation.transport_cost.toFixed(2)} <br /> */}
                            <strong>Travel Time:</strong>{" "}
                            {reallocation.travel_time_min.toFixed(2)} mins{" "}
                            <br />
                            <strong>Distance:</strong>{" "}
                            {reallocation.distance_km.toFixed(2)} km
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No reallocations available."
                    )}
                    <div style={{ marginTop: "5px" }}>
                      <ul style={{ marginTop: "5px" }}>
                        {storeReallocations.map((reallocation, index) => (
                          <li
                            key={index}
                            style={{
                              listStyleType: "none",
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            {reallocation.route_polyline && (
                              <button
                                onClick={() =>
                                  plotSingleRoute(
                                    reallocation.route_polyline,
                                    index + 1
                                  )
                                }
                                style={{
                                  backgroundColor: "#010",
                                  color: "white",
                                  border: "none",
                                  padding: "5px 10px",
                                  margin: "2px 0",
                                  borderRadius: "3px",
                                }}
                              >
                                View Route {index + 1}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* Dashboard Section */}
        <div className="dashboard">
          {reallocations.map((reallocation, index) => (
            <div className="tile" key={index}>
              <h6>Reallocation Details</h6>
              <p>
                <strong>From Store:</strong> {reallocation.from_store_name}
              </p>
              <p>
                <strong>To Store:</strong> {reallocation.to_store_name}
              </p>
              {/* <strong>Brand:</strong>
              <img
                src={getBrandIcon(reallocation.brand).options.iconUrl}
                alt={reallocation.brand}
                style={{
                  width: "100px",
                  height: "70px",
                  marginLeft: "5px",
                  verticalAlign: "middle",
                }}
              /> */}
              <p>
                <strong>Item Category:</strong> {reallocation.item_category}
              </p>
              <p>
                <strong>Profit:</strong> {reallocation.brand}
              </p>
              <p>
                <strong>Count:</strong> {reallocation.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="allocation-body">
  //     <style>
  //       {`
  //       .allocation-body {
  //         min-height: 100vh;
  //         background: #F9F3EF;
  //         margin-left: 320px;
  //         padding: 30px 3px 50px;
  //       }

  //       .spinner {
  //         position: absolute;
  //         top: 50%;
  //         left: 50%;
  //         transform: translate(-50%, -50%);
  //         font-size: 24px;
  //       }

  //       .dashboard {
  //         display: flex;
  //         flex-wrap: wrap;
  //         justify-content: space-around;
  //         margin-top: 20px;
  //       }

  //       .tile {
  //         background: #f8f9fa;
  //         border: 1px solid #dee2e6;
  //         border-radius: 5px;
  //         padding: 15px;
  //         margin: 10px;
  //         width: calc(33% - 20px);
  //         box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  //       }

  //       .ReactModal__Overlay {
  //         background-color: rgba(0, 0, 0, 0.75);
  //       }

  //       .ReactModal__Content {
  //         top: 50%;
  //         left: 50%;
  //         right: auto;
  //         bottom: auto;
  //         transform: translate(-50%, -50%);
  //         width: 80%;
  //         max-width: 600px;
  //         padding: 20px;
  //         border-radius: 10px;
  //         background-color: white;
  //       }

  //       button {
  //         margin: 10px;
  //         padding: 10px 20px;
  //         font-size: 16px;
  //         cursor: pointer;
  //         border: none;
  //         border-radius: 5px;
  //         background-color: #007bff;
  //         color: white;
  //         transition: background-color 0.3s;
  //       }

  //       button:hover {
  //         background-color: #0056b3;
  //       }

  //       h1 {
  //         text-align: center;
  //         margin-bottom: 20px;
  //       }
  //       `}
  //     </style>
  //     <div className="position-relative">
  //       <h5>Stock Reallocation Map</h5>
  //       <button
  //         onClick={triggerReallocation}
  //         style={{
  //           position: "fixed", // Change from absolute to fixed
  //           top: "10px",
  //           right: "10px",
  //           backgroundColor: "black",
  //           color: "white",
  //           padding: "10px 20px",
  //           border: "none",
  //           borderRadius: "5px",
  //           cursor: "pointer",
  //           zIndex: 1000, // Ensure it's above the map
  //         }}
  //       >
  //         {loading ? "Processing..." : "Trigger Stock Reallocation"}
  //       </button>
  //       {/* Plot Routes Button */}
  //       <button
  //         onClick={plotReallocationRoutes}
  //         disabled={plotRoutes || loading || reallocations.length === 0}
  //         style={{
  //           position: "fixed",
  //           top: "60px",
  //           right: "10px",
  //           backgroundColor: plotRoutes ? "gray" : "#010",
  //           color: "white",
  //           padding: "10px 20px",
  //           border: "none",
  //           borderRadius: "5px",
  //           cursor: plotRoutes ? "not-allowed" : "pointer",
  //           zIndex: 1000,
  //         }}
  //       >
  //         {plotRoutes ? "Routes Plotted" : "Plot Routes"}
  //       </button>
  //       {/* MapContainer */}
  //       <MapContainer
  //         center={[20.5937, 78.9629]} // Centering on India
  //         zoom={5} // Adjust zoom
  //         style={{ height: "630px", width: "100%" }}
  //         ref={mapRef}
  //         maxBounds={[
  //           [8.0, 68.0], // South-West
  //           [37.0, 97.0], // North-East
  //         ]}
  //         maxBoundsViscosity={1.0}
  //       >
  //         <TileLayer
  //           url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  //           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  //         />

  //         {Array.isArray(stores) &&
  //           stores.map((store) => (
  //             <Marker
  //               key={store.store_id}
  //               position={[store.location_x, store.location_y]}
  //               eventHandlers={{
  //                 click: () => openModal(store),
  //                 mouseover: () => setHoveredStore(store.store_id),
  //                 mouseout: () => setHoveredStore(null),
  //               }}
  //               icon={createCustomIcon(
  //                 store.inventory,
  //                 store.brand,
  //                 hoveredStore === store.store_id
  //               )}
  //             >
  //               <Popup>
  //                 Store: {store.store_name} <br />
  //                 Inventory: {store.inventory} <br />
  //                 {/* Brand: {store.brand} <br /> */}
  //                 Demand: {store.demand}
  //               </Popup>
  //             </Marker>
  //           ))}
  //       </MapContainer>
  //       {/* MapContainer */}
  //       <div className="dashboard">
  //         {reallocations.map((reallocation, index) => (
  //           <div className="tile" key={index}>
  //             <h6>Reallocation Details</h6>
  //             <p>
  //               <strong>From Store:</strong> {reallocation.from_store}
  //             </p>
  //             <p>
  //               <strong>To Store:</strong> {reallocation.to_store}
  //             </p>
  //             <strong>Brand:</strong>
  //             <img
  //               src={getBrandIcon(reallocation.brand).options.iconUrl} // Use brand logo from the mapping
  //               alt={reallocation.brand}
  //               style={{
  //                 width: "100px",
  //                 height: "70px",
  //                 marginLeft: "5px",
  //                 verticalAlign: "middle",
  //               }}
  //             />
  //             {/* {reallocation.brand} */}
  //             <p>
  //               <strong>Profit:</strong> {reallocation.profit}
  //             </p>
  //             <p>
  //               <strong>Count:</strong> {reallocation.amount}
  //             </p>
  //           </div>
  //         ))}
  //       </div>

  //       {/* <Modal
  //         isOpen={modalIsOpen}
  //         onRequestClose={closeModal}
  //         contentLabel="Store Details"
  //         ariaHideApp={false}
  //         style={{
  //           overlay: {
  //             zIndex: 1000, // Ensure overlay is above the map
  //             backgroundColor: "rgba(0, 0, 0, 0.7)", // Optional: add a dim background
  //           },
  //           content: {
  //             top: "50%",
  //             left: "50%",
  //             right: "auto",
  //             bottom: "auto",
  //             transform: "translate(-50%, -50%)",
  //             padding: "20px",
  //             zIndex: 1001, // Ensure content is above the overlay
  //           },
  //         }}
  //       >
  //         {selectedStore && (
  //           <div>
  //             <h6>Store {selectedStore.store_id} Statistics</h6>
  //             <LineChart width={400} height={200} data={[selectedStore]}>
  //               <Line type="monotone" dataKey="inventory" stroke="#8884d8" />
  //               <CartesianGrid stroke="#ccc" />
  //               <XAxis dataKey="store_id" />
  //               <YAxis />
  //               <Tooltip />
  //             </LineChart>
  //             <button onClick={closeModal}>Close</button>
  //           </div>
  //         )}
  //       </Modal> */}
  //     </div>
  //   </div>
  // );
};

export default Map;

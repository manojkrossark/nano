import L from "leaflet";

// Define the type for brand names (keys of the brandIcons object)
type BrandName =
  | "Samsung"
  | "LG"
  | "Sony"
  | "Panasonic"
  | "Apple"
  | "Dell"
  | "HP"
  | "Asus"
  | "Microsoft"
  | "Lenovo";

// Define custom icons for brand logos
const brandIcons: Record<BrandName, L.Icon> = {
  Samsung: new L.Icon({
    iconUrl: "/icons/samsung.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  LG: new L.Icon({
    iconUrl: "/icons/lg.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  Sony: new L.Icon({
    iconUrl: "/icons/sony.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  Panasonic: new L.Icon({
    iconUrl: "/icons/panasonic.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  Apple: new L.Icon({
    iconUrl: "/icons/apple.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  Dell: new L.Icon({
    iconUrl: "/icons/dell.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  HP: new L.Icon({
    iconUrl: "/icons/hp.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  Asus: new L.Icon({
    iconUrl: "/icons/asus.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  Microsoft: new L.Icon({
    iconUrl: "/icons/microsoft.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  Lenovo: new L.Icon({
    iconUrl: "/icons/lenovo.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
};

// Function to get icon by brand name
export const getBrandIcon = (brand: BrandName): L.Icon => {
  return brandIcons[brand] || brandIcons["Samsung"]; // Default icon
};

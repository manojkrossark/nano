import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";
import dynamic from "next/dynamic";
const DynamicComponentWithNoSSR = dynamic(() => import("./Ev_station"), {
  ssr: false,
});
const Stations = () => {
  return (
    <>
      <DashboardHeaderOne />
      <DynamicComponentWithNoSSR />
    </>
  );
};

export default Stations;

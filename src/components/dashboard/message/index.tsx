import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";
import DeliveryScheduler from "./MessageBody";
import InventoryDashboard from "../InventoryDashboard";
import Home from "../PredictDemand";

const DashboardMessage = () => {
  return (
    <>
      <DashboardHeaderOne />
      {/* <DeliveryScheduler /> */}
      {/* <InventoryDashboard /> */}
      <Home />
    </>
  );
};

export default DashboardMessage;

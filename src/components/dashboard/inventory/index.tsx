import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";
import dynamic from 'next/dynamic'
const DynamicComponentWithNoSSR = dynamic(
  () => import('./Map'),
  { ssr: false }
)
const DashboardInventory = () => {
  return (
    <>
      <DashboardHeaderOne />
      <DynamicComponentWithNoSSR />
    </>
  );
};

export default DashboardInventory;

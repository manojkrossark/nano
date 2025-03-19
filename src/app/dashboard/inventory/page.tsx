import DashboardInventory from "@/components/dashboard/inventory";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
   title: "Dashboard Message Homy - Real Estate React Next js Template",
};
const index = () => {
   return (
      <Wrapper>
         <DashboardInventory />
      </Wrapper>
   )
}

export default index
import Stations from "@/components/dashboard/station";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Dashboard Message Homy - Real Estate React Next js Template",
};
const index = () => {
  return (
    <Wrapper>
      <Stations />
    </Wrapper>
  );
};

export default index;

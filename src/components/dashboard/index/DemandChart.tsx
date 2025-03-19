import { Line } from "react-chartjs-2";

const DemandChart = () => {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Sales Value",
        data: [100000, 75000, 120000, 90000, 105000, 78000],
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  };

  return <Line data={data} />;
};

export default DemandChart;

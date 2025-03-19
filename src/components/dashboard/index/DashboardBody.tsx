"use client";
import React, { ChangeEvent } from "react";
import Image, { StaticImageData } from "next/image";
import NiceSelect from "@/ui/NiceSelect";
import RecentMessage from "./RecentMessage";
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo";
import DashboardChart from "./DashboardChart";
import DeliveryEstimates from "./DeliveryEstimates"; // New component for delivery estimates
import ProductRecommendations from "./ProductRecommendations"; // New component for product recommendations
import SustainableOptions from "./SustainableOptions"; // New component for sustainable options
import LocationIntelligenceTool from "./LocationIntelligenceTool";
import Map from "./Map";
import DemandForecastingDashboard from "./DemandForecastingDashboard";
import PersonalizationEngine from "./PersonalizationEngine";
import IntegratedAnalyticsPlatform from "./IntegratedAnalyticsPlatform";

// Icon Imports
import iconAllProperties from "@/assets/images/dashboard/icon/icon_12.svg";
import iconTotalPending from "@/assets/images/dashboard/icon/icon_13.svg";
import iconTotalViews from "@/assets/images/dashboard/icon/icon_14.svg";
import iconTotalFavourites from "@/assets/images/dashboard/icon/icon_15.svg";
import Forecast from "./DemandForecastingDashboard";
import InventoryDashboard from "../InventoryDashboard";
import DeliveryScheduler from "../message/EmailReadPanel";

// Data Type Interface
interface DataType {
  id: number;
  icon: StaticImageData;
  title: string;
  value: string;
  className?: string;
}

// Dashboard Card Data
const dashboardCardData: DataType[] = [
  {
    id: 1,
    icon: iconAllProperties,
    title: "All Stocks",
    value: "1.7k+",
    className: "skew-none",
  },
  {
    id: 2,
    icon: iconTotalPending,
    title: "Total Pending Stocks",
    value: "03",
  },
  {
    id: 3,
    icon: iconTotalViews,
    title: "Total Inventory Checks",
    value: "4.8k",
  },
  {
    id: 4,
    icon: iconTotalFavourites,
    title: "Total High Demand",
    value: "07",
  },
];

const DashboardBody = () => {
  const selectHandler = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    console.log(selectedValue); // Handle the selected value here
  };

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Dashboard" />
        <h2 className="main-title d-block d-lg-none">Dashboard</h2>

        <div className="bg-white border-20">
          <div className="row">
            {dashboardCardData.map((item) => (
              <div key={item.id} className="col-lg-3 col-6">
                <div
                  className={`dash-card-one bg-white border-30 position-relative mb-15 ${item.className}`}
                >
                  <div className="d-sm-flex align-items-center justify-content-between">
                    <div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1">
                      <Image
                        src={item.icon}
                        alt={item.title}
                        className="lazy-img"
                      />
                    </div>
                    <div className="order-sm-0">
                      <span>{item.title}</span>
                      <div className="value fw-500">{item.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="row gx-xxl-5 d-flex pt-15 lg-pt-10">
          <div className="col-xl-7 col-lg-6 d-flex flex-column">
            <div className="user-activity-chart bg-white border-20 mt-30 h-100">
              <div className="d-flex align-items-center justify-content-between plr">
                <h5 className="dash-title-two">Demand Forecast</h5>
                <div className="short-filter d-flex align-items-center">
                  <div className="fs-16 me-2">Short by:</div>
                  <NiceSelect
                    className="nice-select fw-normal"
                    options={[
                      { value: "weekly", text: "Weekly" },
                      { value: "daily", text: "Daily" },
                      { value: "monthly", text: "Monthly" },
                    ]}
                    defaultCurrent={1}
                    onChange={selectHandler}
                    name="timeframe"
                    placeholder="Select timeframe"
                  />
                </div>
              </div>
              <div className="plr mt-50">
                <div className="chart-wrapper">
                  <DashboardChart />
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-5 col-lg-6 d-flex">
            <div className="recent-job-tab bg-white border-20 mt-30 plr w-100">
              <h5 className="dash-title-two">Delivery Slots</h5>
              {/* <RecentMessage /> */}
              <InventoryDashboard />
              {/* <DeliveryScheduler /> */}
            </div>
          </div>
        </div>

        {/* New sections for additional features in two columns */}
        <div className="row gx-xxl-5 d-flex pt-15 lg-pt-10">
          <div className="col-md-6 d-flex flex-column">
            {/* <div className="bg-white border-20 mt-30 p-3">
              <h5 className="dash-title-two">Delivery Estimates</h5>
              <DeliveryEstimates />
            </div> */}
            <div className="bg-white border-20 mt-30 p-3">
              <h5 className="dash-title-two">Location Intelligence Tool</h5>
              <LocationIntelligenceTool />
            </div>
            <div className="bg-white border-20 mt-30 p-3">
              {/* <h5 className="dash-title-two">Inventory Dashboard</h5> */}
              {/* <PersonalizationEngine /> */}
              <InventoryDashboard />
            </div>
          </div>

          <div className="col-md-6 d-flex flex-column">
            <div className="bg-white border-20 mt-30 p-3">
              <h5 className="dash-title-two">Demand Forecasting Dashboard</h5>
              {/* <DemandForecastingDashboard /> */}
              <Forecast />
            </div>
            {/* <div className="bg-white border-20 mt-30 p-3">
              <h5 className="dash-title-two">Integrated Analytics Platform</h5>
              <IntegratedAnalyticsPlatform />
            </div>
            <div className="bg-white border-20 mt-30 p-3">
              <h5 className="dash-title-two">Product Recommendations</h5>
              <ProductRecommendations />
            </div> */}
          </div>

          {/* <div className="col-12 d-flex flex-column">
            <div className="bg-white border-20 mt-30 p-3">
              <h5 className="dash-title-two">Sustainable Options</h5>
              <SustainableOptions />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardBody;

"use client";
import { useState } from "react";
import NiceSelect from "@/ui/NiceSelect";
import Link from "next/link";
import DropdownModal from "./DropdownModal";
import { Card, CardContent } from "@mui/material";

const tab_title: string[] = ["Buy", "Rent", "SELL"];

const DropdownSeven = ({ chargingStation, aiRecommendation }: any) => {
  const selectHandler = (e: any) => {};
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: any) => {
    setActiveTab(index);
  };

  const searchHandler = () => {
    window.location.href = "/listing_01";
  };

  return (
    <>
      <div className="search-wrapper-one layout-one position-relative">
        {/* <nav className="search-filter-nav-one d-flex">
          <div className="nav nav-tabs border-0" role="tablist">
            {tab_title.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`nav-link ${activeTab === index ? "active" : ""}`}
                id="buy-tab"
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </nav> */}

        <div className="bg-wrapper border-0">
          <div className="tab-content">
            <div
              className={`tab-pane show ${activeTab === 0 ? "active" : ""}`}
              id="buy"
            >
              <div className="mt-6 overflow-x-auto whitespace-nowrap flex gap-4 p-2">
                {/* AI Recommendation */}
                {aiRecommendation && (
                  <Card className="min-w-[250px] shadow-lg rounded-lg p-3 border border-gray-300 bg-white">
                    <CardContent>
                      <h5 className="text-lg font-bold text-purple-700">
                        🤖 AI Recommendation
                      </h5>
                      <p className="text-gray-700 text-sm">
                        ⏳ Best Time:{" "}
                        <span className="font-bold text-blue-600">
                          {aiRecommendation.best_time_to_charge}
                        </span>
                      </p>
                      <p className="text-gray-700 text-sm">
                        🚦 Peak Hours:{" "}
                        <span className="font-bold text-red-500">
                          {aiRecommendation.peak_hours.join(", ")}
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Top 3 Recommended Stations */}
                {aiRecommendation?.top_3_stations?.length > 0 &&
                  aiRecommendation.top_3_stations.map((station, index) => (
                    <Card
                      key={index}
                      className="min-w-[250px] shadow-lg rounded-lg p-3 border border-gray-300 bg-white"
                    >
                      <CardContent>
                        <h6 className="text-lg font-bold text-blue-700">
                          #{index + 1} {station.name}
                        </h6>
                        <p className="text-gray-700 text-sm">
                          📍 Location: {station.location}
                        </p>
                        <p className="text-gray-700 text-sm">
                          💰 Price per kWh: ₹{station.price_per_kwh}
                        </p>
                        <p className="text-gray-700 text-sm">
                          🚗 Distance: {station.user_distance_km} km
                        </p>
                        <p className="text-gray-700 text-sm">
                          ⏳ Travel Time: {station.estimated_travel_time_min}{" "}
                          mins
                        </p>
                        <p className="text-gray-700 text-sm">
                          ⚡ Cost for 10kWh: ₹{station.estimated_cost_for_10kWh}
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                {/* Weather Conditions */}
                {aiRecommendation?.weather && (
                  <Card className="min-w-[250px] shadow-lg rounded-lg p-3 border border-gray-300 bg-white">
                    <CardContent>
                      <h5 className="text-lg font-bold text-[#D2FF28]">
                        🌤 Weather
                      </h5>
                      <p className="text-gray-700 text-sm">
                        🌡 Temperature: {aiRecommendation.weather.temperature}°C
                      </p>
                      <p className="text-gray-700 text-sm">
                        💨 Wind: {aiRecommendation.weather.wind_speed} km/h
                      </p>
                      <p className="text-gray-700 text-sm">
                        💧 Humidity: {aiRecommendation.weather.humidity}%
                      </p>
                      <p className="text-gray-700 text-sm">
                        ☀️ Condition: {aiRecommendation.weather.condition}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* <div className="mt-6">
                {chargingStation && (
                  <Card className="shadow-lg rounded-xl p-4 border border-gray-300 bg-white">
                    <CardContent>
                      <h5 className="text-2xl font-bold text-[#D2FF28]">
                        ⚡ {chargingStation.name}
                      </h5>
                      <p className="text-gray-700">
                        📍 Location: {chargingStation.location}
                      </p>
                      <p className="text-gray-700">
                        💰 Price per kWh: ₹{chargingStation.price_per_kwh}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {aiRecommendation && (
                  <Card className="shadow-lg rounded-xl p-4 border border-gray-300 bg-white mt-4">
                    <CardContent>
                      <h5 className="text-2xl font-bold text-purple-700">
                        🤖 AI Recommendation
                      </h5>
                      <p className="text-gray-700">
                        ⏳ Best Time:{" "}
                        <span className="font-bold text-blue-600">
                          {aiRecommendation.best_time_to_charge}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        🚦 Peak Hours:{" "}
                        <span className="font-bold text-red-500">
                          {aiRecommendation.peak_hours.join(", ")}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        ⚠️ {aiRecommendation.important_note}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {aiRecommendation?.top_3_stations &&
                  aiRecommendation.top_3_stations.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-2xl font-bold text-green-600">
                        🔋 Top 3 Recommended Stations
                      </h5>
                      {aiRecommendation.top_3_stations.map((station, index) => (
                        <Card
                          key={index}
                          className="shadow-lg rounded-xl p-4 border border-gray-300 bg-white mt-2"
                        >
                          <CardContent>
                            <h6 className="text-xl font-bold text-blue-700">
                              #{index + 1} {station.name}
                            </h6>
                            <p className="text-gray-700">
                              📍 Location: {station.location}
                            </p>
                            <p className="text-gray-700">
                              💰 Price per kWh: ₹{station.price_per_kwh}
                            </p>
                            <p className="text-gray-700">
                              🚗 Distance: {station.user_distance_km} km
                            </p>
                            <p className="text-gray-700">
                              ⏳ Estimated Travel Time:{" "}
                              {station.estimated_travel_time_min} mins
                            </p>
                            <p className="text-gray-700">
                              ⚡ Estimated Cost for 10kWh: ₹
                              {station.estimated_cost_for_10kWh}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                {aiRecommendation?.weather && (
                  <Card className="shadow-lg rounded-xl p-4 border border-gray-300 bg-white mt-4">
                    <CardContent>
                      <h5 className="text-2xl font-bold text-[#D2FF28]">
                        🌤 Weather Conditions
                      </h5>
                      <p className="text-gray-700">
                        🌡 Temperature: {aiRecommendation.weather.temperature}°C
                      </p>
                      <p className="text-gray-700">
                        💨 Wind Speed: {aiRecommendation.weather.wind_speed}{" "}
                        km/h
                      </p>
                      <p className="text-gray-700">
                        💧 Humidity: {aiRecommendation.weather.humidity}%
                      </p>
                      <p className="text-gray-700">
                        ☀️ Condition: {aiRecommendation.weather.condition}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div> */}
              {/* <form
                onSubmit={(e) => {
                  e.preventDefault();
                  searchHandler();
                }}
              >
                <div className="row gx-0 align-items-center">
                  <div className="col-xxl-2 col-xl-3 col-lg-4">
                    <div className="input-box-one border-left">
                      <div className="label">I’m looking to...</div>
                      <NiceSelect
                        className="nice-select fw-normal"
                        options={[
                          { value: "apartments", text: "Buy Apartments" },
                          { value: "condos", text: "Rent Condos" },
                          { value: "houses", text: "Sell Houses" },
                          { value: "industrial", text: "Rent Industrial" },
                          { value: "villas", text: "Sell Villas" },
                        ]}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name=""
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-4">
                    <div className="input-box-one border-left">
                      <div className="label">Location</div>
                      <NiceSelect
                        className="nice-select location fw-normal"
                        options={[
                          { value: "germany", text: "Berlin, Germany" },
                          { value: "dhaka", text: "Dhanmondi, Dhaka" },
                          { value: "mexico", text: "Acapulco, Mexico" },
                          { value: "france", text: "Cannes, France" },
                          { value: "india", text: "Delhi, India" },
                          { value: "giza", text: "Giza, Egypt" },
                          { value: "cuba", text: "Havana, Cuba" },
                        ]}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name=""
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="col-xl-3 col-lg-4">
                    <div className="input-box-one border-left border-lg-0">
                      <div className="label">Price Range</div>
                      <NiceSelect
                        className="nice-select fw-normal"
                        options={[
                          { value: "1", text: "$10,000 - $200,000" },
                          { value: "2", text: "$20,000 - $300,000" },
                          { value: "3", text: "$30,000 - $400,000" },
                        ]}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name=""
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="col-xxl-4 col-xl-3">
                    <div className="input-box-one lg-mt-10">
                      <div className="d-flex align-items-center justify-content-center">
                        <Link
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#advanceFilterModal"
                          className="search-modal-btn tran3s text-uppercase fw-500 d-inline-flex align-items-center rounded-3 me-3"
                        >
                          <span className="d-xl-none d-xxl-block">
                            ADVANCE Search
                          </span>
                          <i className="fa-light fa-sliders-up"></i>
                        </Link>
                        <button className="fw-500 text-uppercase tran3s search-btn-four rounded-3">
                          <span>Search</span>
                          <i className="fa-light fa-magnifying-glass"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form> */}
            </div>
          </div>
        </div>
      </div>
      <DropdownModal />
    </>
  );
};

export default DropdownSeven;

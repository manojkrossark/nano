import { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  Card,
  Grid,
  CircularProgress,
} from "@mui/material";
import DemandMap from "./DemandMap";
import DemandChart from "./DemandChart";
import { BASE_API_URL } from "@/utils/constants";

const Forecast = () => {
  const [forecastData, setForecastData] = useState(null);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_API_URL}api/forecast}`, {
        category: "Electronics",
        region: "North",
      });
      setForecastData(response.data.forecast);
      setInsights(response.data.insights);
    } catch (error) {
      console.error("Error fetching forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderInsights = () => {
    // Convert the recommendation text to a structured format
    const recommendationLines = insights
      .split("\n")
      .filter((line) => line.trim() !== "");

    return (
      <ul>
        {recommendationLines.map((line, index) => {
          // Remove all asterisks from the line
          const cleanLine = line.replace(/\*/g, "").trim();

          return <li key={index}>{cleanLine}</li>;
        })}
      </ul>
    );
  };
  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Card>
          <Typography variant="h6" align="center">
            Demand Forecast
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Typography>{forecastData}</Typography>
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <Typography variant="h6" align="center">
            AI-Generated Insights
          </Typography>
          <Typography>{renderInsights()}</Typography>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <DemandMap />
      </Grid>

      <Grid item xs={12}>
        <DemandChart />
      </Grid>

      <Grid item xs={12} sx={{ textAlign: "center" }}>
        <Button variant="contained" onClick={fetchForecast}>
          Refresh Forecast
        </Button>
      </Grid>
    </Grid>
  );
};

export default Forecast;

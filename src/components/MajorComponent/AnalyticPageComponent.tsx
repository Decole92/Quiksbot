"use client";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dynamic from "next/dynamic";
import ChartComponent from "@/components/ChartComponent";
import useSWR from "swr";
import { chartBarData } from "@/actions/customer";
import {
  HeatmapLayerF,
  Libraries,
  useLoadScript,
} from "@react-google-maps/api";
import useSubcription from "@/hook/useSubscription";
import UpgradeBanner from "../UpgradeBanner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GoogleMap = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.GoogleMap),
  { ssr: false }
);
const HeatmapLayer = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.HeatmapLayer),
  { ssr: false }
);

const mapStyles = {
  height: "500px",
  width: "100%",
};

const center = {
  lat: 20.0,
  lng: 0.0,
};

const libraries = ["visualization"];

const AnalyticsClient = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    libraries: libraries as Libraries,
  });
  const { hasActiveMembership } = useSubcription();
  const [HeatmapLayer, setHeatmapLayer] = useState(null);
  const { data, error } = useSWR(
    "/api/getChartData",
    async () => await chartBarData()
  );
  const { chartData = [], heatmapData = [] } = data || {};
  useEffect(() => {
    if (isLoaded) {
      import("@react-google-maps/api").then((mod: any) => {
        setHeatmapLayer(() => mod.HeatmapLayer());
      });
    }
  }, [isLoaded]);
  if (loadError) return <div>Error loading maps</div>;
  if (error) return <div>Failed to load chart data</div>;
  if (!isLoaded || !data) return <div>Loading...</div>;

  return (
    <div className='w-full mt-16  md:max-w-3xl md:mx-auto lg:max-w-5xl lg:mx-auto p-5 h-full lg:max-h-screen md:max-h-screen relative'>
      {hasActiveMembership === "STANDARD" ? (
        <UpgradeBanner />
      ) : (
        <>
          <div className='bg-white shadow-md dark:bg-gray-900 rounded p-4 mb-8'>
            <ChartComponent />
          </div>
          <div className='relative h-500 w-full bg-gray-200 rounded shadow-md'>
            <GoogleMap mapContainerStyle={mapStyles} zoom={2} center={center}>
              {heatmapData.length > 0 && (
                <HeatmapLayerF
                  data={heatmapData.map((point: any) => ({
                    location: new window.google.maps.LatLng(
                      point.lat,
                      point.lng
                    ),
                    weight: 1,
                  }))}
                  options={{ radius: 50 }}
                />
              )}
            </GoogleMap>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsClient;

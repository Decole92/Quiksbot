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
import type { Metadata } from "next";
import ChartComponent from "@/components/ChartComponent";
import useSWR from "swr";
import { chartBarData } from "@/actions/customer";
import {
  HeatmapLayerF,
  Libraries,
  useLoadScript,
} from "@react-google-maps/api";

// export const metadata: Metadata = {
//   title:
//     "AI Chatbot for Websites | Engage Leads with AI-Powered SalesBot | Quiksbot Analytics",
//   description:
//     "Boost your business with Quiksbot's AI-powered chatbot analytics. Track chatbot performance, optimize customer interactions, and drive lead generation. Quiksbot's analytics tools help you monitor chatbot engagement, conversion rates, and customer satisfaction. Easily integrate with OpenAI API for custom chat solutions. Learn how chatbots can increase sales, improve customer service, and provide real-time insights. Ideal for businesses looking to embed chatbots, monitor user behavior, and enhance customer engagement with AI-driven analytics.",
//   keywords:
//     "AI chatbot analytics, chatbot performance tracking, chatbot for websites, SalesBot analytics, AI chatbot for lead generation, customer service chatbot, chatbot engagement metrics, chatbot conversion tracking, OpenAI API chatbot, website chatbot embedding, chatbot for increasing sales, chatbot for customer satisfaction, AI-powered chatbot analytics, real-time chatbot insights, chatbot optimization, business chatbot analytics, Quiksbot AI solutions, chatbot interaction data, chatbot for business growth, chatbot with PDF interaction, chatbot analytic tools",
// };

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

const AnalyticsPage = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    libraries: libraries as Libraries,
  });
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
    <div className='w-full mt-16  md:max-w-3xl md:mx-auto lg:max-w-6xl lg:mx-auto p-5 h-full lg:max-h-screen md:max-h-screen '>
      <div className='bg-white shadow-md dark:bg-gray-900 rounded p-4 mb-8'>
        <ChartComponent />
      </div>
      <div className='relative h-500 w-full bg-gray-200 rounded shadow-md'>
        <GoogleMap mapContainerStyle={mapStyles} zoom={2} center={center}>
          {heatmapData.length > 0 && (
            <HeatmapLayerF
              data={heatmapData.map((point: any) => ({
                location: new window.google.maps.LatLng(point.lat, point.lng),
                weight: 1,
              }))}
              options={{ radius: 50 }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default AnalyticsPage;

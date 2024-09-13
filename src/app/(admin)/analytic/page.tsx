// "use client"
// import { useState, useEffect } from "react";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
// import { Bar } from "react-chartjs-2";
// import dynamic from 'next/dynamic';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import ChartComponent from "@/components/ChartComponent";
// import useSWR from "swr";
// import { chartBarData } from "@/actions/customer";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const GoogleMap = dynamic(() => import('@react-google-maps/api').then(mod => mod.GoogleMap), { ssr: false });
// const HeatmapLayer = dynamic(() => import('@react-google-maps/api').then(mod => mod.HeatmapLayer), { ssr: false });

// const mapStyles = {
//   height: "500px",
//   width: "100%",
// };

// const center = {
//   lat: 20.0,
//   lng: 0.0,
// };

// const AnalyticsPage = () => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const { data, error } = useSWR("/api/getChartData", async () => await chartBarData());
//   const { chartData = [], heatmapData = [] } = data || {};

//   useEffect(() => {
//     if (typeof window !== 'undefined' && !window.google) {
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=visualization`;
//       script.async = true;
//       script.onload = () => setIsLoaded(true);
//       document.body.appendChild(script);
//     } else {
//       setIsLoaded(true);
//     }
//   }, []);

//   if (error) return <div>Failed to load chart data</div>;
//   if (!data) return <div>Loading...</div>;

//   return (
//     <div className="w-full mt-16 h-full md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto p-5">
//       <div className="bg-white shadow-md rounded p-4 mb-8">
//         <ChartComponent />
//       </div>
//       <div className="relative h-500 w-full bg-gray-200 rounded shadow-md">
//         {isLoaded && (
//           <GoogleMap mapContainerStyle={mapStyles} zoom={2} center={center}>
//             {heatmapData.length > 0 && (
//               <HeatmapLayer
//                 data={heatmapData.map((point: any) => ({
//                   location: new window.google.maps.LatLng(point.lat, point.lng),
//                   weight: 1,
//                 }))}
//                 options={{ radius: 50 }}
//               />
//             )}
//           </GoogleMap>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AnalyticsPage;

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
import { Bar } from "react-chartjs-2";
import dynamic from "next/dynamic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChartComponent from "@/components/ChartComponent";
import useSWR from "swr";
import { chartBarData } from "@/actions/customer";
import {
  HeatmapLayerF,
  Libraries,
  useLoadScript,
} from "@react-google-maps/api";

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
    <div className='w-full mt-16 h-full md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto p-5'>
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

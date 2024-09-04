
"use client"
import useSWR from "swr";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { chartBarData } from "@/actions/customer";
import { useEffect, useMemo, useState } from "react";

const ChartComponent = () => {
  const { data, error } = useSWR("/api/getChartData", async () => await chartBarData());
  const { chartData = [], } = data || {};

  const [activeChart, setActiveChart] = useState<string>("");

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const firstKey = Object.keys(chartData[0]).find((key) => key !== "date");
      if (firstKey) {
        setActiveChart(firstKey);
      }
    }
  }, [chartData]);

  const total = useMemo(() => {
    if (!chartData) return {};
  
    return chartData.reduce((acc: any, curr) => {
      Object.keys(curr).forEach((key) => {
        if (key !== "date") {
          acc[key] = (acc[key] || 0) + (curr[key] || 0);
        }
      });
      return acc;
    }, {});
  }, [chartData]);

  if (error) return <div>Failed to load chart data</div>;
  if (!chartData) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>Showing total customers for the last 3 months</CardDescription>
        </div>
        <div className="flex">
          {Object.keys(chartData[0] || {})
            .filter((key) => key !== "date")
            .map((key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">{key}</span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                {total[key].toLocaleString()}
                </span>
              </button>
            ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={{
            [activeChart]: {
              label: activeChart,
              color: "hsl(var(--chart-1))",
            },
          }}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
           
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ChartComponent;
    
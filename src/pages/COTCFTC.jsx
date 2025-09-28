import React, { useState, useEffect } from "react";
import { COTData } from "@/entities/COTData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function COTCFTCPage() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await COTData.list("date", 1000);
      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const commodities = ["WHEAT", "CORN", "SOYBEAN"];
  const currentCommodity = commodities[currentIndex];

  const chartData = data
    .filter(item => item.commodity === currentCommodity)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      date: item.date,
      net_positions: item.net_positions,
      long_positions: item.long_positions,
      short_positions: item.short_positions
    }));

  const nextChart = () => {
    setCurrentIndex((prev) => (prev + 1) % commodities.length);
  };

  const prevChart = () => {
    setCurrentIndex((prev) => (prev - 1 + commodities.length) % commodities.length);
  };

  const getColorForCommodity = (commodity) => {
    const colors = {
      "WHEAT": "#f59e0b",
      "CORN": "#10b981", 
      "SOYBEAN": "#8b5cf6"
    };
    return colors[commodity] || "#6b7280";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getColorForCommodity(currentCommodity) }}
            />
            COT CFTC {currentCommodity}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevChart}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={nextChart}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value, name) => [
                      `${value?.toLocaleString()}`,
                      name.replace('_', ' ').toUpperCase()
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net_positions" 
                    stroke={getColorForCommodity(currentCommodity)}
                    strokeWidth={3}
                    dot={false}
                    name="Net Positions"
                    activeDot={{ r: 6, fill: getColorForCommodity(currentCommodity) }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

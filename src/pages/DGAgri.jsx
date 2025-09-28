import React, { useState, useEffect } from "react";
import { DGAgriData } from "@/entities/DGAgriData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DGAgriPage() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await DGAgriData.list("period", 1000);
      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const chartConfigs = [
    {
      title: "E.U. WHEAT EXPORT 01.07.25-16.09.2025",
      commodity: "WHEAT",
      trade_type: "EXPORT",
      color: "#f59e0b"
    },
    {
      title: "E.U. WHEAT IMPORTS 01.07-16.09.2025", 
      commodity: "WHEAT",
      trade_type: "IMPORT",
      color: "#06b6d4"
    },
    {
      title: "E.U. CORN IMPORTS 01.07-16.09.2025",
      commodity: "CORN", 
      trade_type: "IMPORT",
      color: "#10b981"
    }
  ];

  const currentConfig = chartConfigs[currentIndex];

  const chartData = data
    .filter(item => 
      item.commodity === currentConfig.commodity && 
      item.trade_type === currentConfig.trade_type
    )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6)
    .map(item => ({
      country: item.country,
      quantity: item.quantity,
      percentage: item.percentage_share
    }));

  const nextChart = () => {
    setCurrentIndex((prev) => (prev + 1) % chartConfigs.length);
  };

  const prevChart = () => {
    setCurrentIndex((prev) => (prev - 1 + chartConfigs.length) % chartConfigs.length);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">
            {currentConfig.title}
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
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="country" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K MT`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px', 
                      color: '#ffffff'
                    }}
                    formatter={(value) => [
                      `${value?.toLocaleString()} MT`,
                      'Quantity'
                    ]}
                  />
                  <Bar 
                    dataKey="quantity" 
                    fill={currentConfig.color}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

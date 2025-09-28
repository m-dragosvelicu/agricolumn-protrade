import React, { useState, useEffect } from "react";
import { DailyPrice } from "@/entities/DailyPrice";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export default function DailyPricesPage() {
  const [data, setData] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState("WHEAT_Furaj");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await DailyPrice.list("date", 1000);
      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const commodities = [
    { id: "WHEAT_Furaj", name: "WHEAT Furaj", currency: "EUR", color: "#8b5cf6" },
    { id: "WHEAT_Panificatie", name: "WHEAT Panificatie", currency: "EUR", color: "#06b6d4" },
    { id: "Barley", name: "Barley", currency: "EUR", color: "#10b981" },
    { id: "Corn", name: "Corn", currency: "EUR", color: "#f59e0b" },
    { id: "Rapeseed", name: "Rapeseed", currency: "EUR", color: "#ef4444" },
    { id: "SFS_DAP", name: "SFS DAP", currency: "USD", color: "#3b82f6" },
    { id: "SFS_FOB", name: "SFS FOB", currency: "USD", color: "#8b5cf6" }
  ];

  const selectedCommodityData = commodities.find(c => c.id === selectedCommodity);
  const chartData = data
    .filter(item => item.commodity === selectedCommodity)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      date: item.date,
      price: item.price,
      volume: item.volume
    }));

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
  const priceChangeLabel = priceChange > 0 ? "▲" : priceChange < 0 ? "▼" : "";
  const priceChangeColor = priceChange > 0 ? "text-green-400" : priceChange < 0 ? "text-red-400" : "text-slate-400";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              {selectedCommodityData?.name} Price Chart
            </CardTitle>
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
                      tickFormatter={(value) => `${value.toFixed(0)} ${selectedCommodityData?.currency}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      formatter={(value) => [
                        `${value?.toFixed(2)} ${selectedCommodityData?.currency}`,
                        'Price'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={selectedCommodityData?.color || "#8b5cf6"}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: selectedCommodityData?.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {!isLoading && (
              <div className="mt-4 flex items-center justify-between rounded-md border border-slate-700/60 bg-slate-800/40 px-4 py-3 text-sm">
                <div className="text-slate-300">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Latest Price</div>
                  <div className="text-lg font-semibold text-white">
                    {currentPrice?.toFixed(2)} {selectedCommodityData?.currency}
                  </div>
                </div>
                <div className={`${priceChangeColor} font-semibold`}>
                  {priceChangeLabel} {Math.abs(priceChange).toFixed(2)} {selectedCommodityData?.currency}
                  <span className="ml-2 text-xs text-slate-400">
                    ({priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Select Commodity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {commodities.map((commodity) => (
              <Button
                key={commodity.id}
                variant={selectedCommodity === commodity.id ? "default" : "ghost"}
                className={`w-full justify-between text-left font-medium transition-all duration-200 ${
                  selectedCommodity === commodity.id
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedCommodity(commodity.id)}
              >
                <span>{commodity.name}</span>
                <span className="text-sm opacity-75">{commodity.currency}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

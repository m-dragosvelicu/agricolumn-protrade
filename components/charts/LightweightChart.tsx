"use client";

import React, { useEffect, useRef, useState } from 'react';

interface LightweightChartProps {
  data: { date: string; price: number }[];
  color?: string;
  height?: number;
  unit?: string;
}

export function LightweightChart({ data, color = '#06b6d4', height = 400, unit = 'EUR' }: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (data.length === 0) {
      setIsLoading(false);
      return;
    }

    let chart: any = null;
    let handleResize: (() => void) | null = null;
    let isSubscribed = true;

    setIsLoading(true);

    // Dynamically import lightweight-charts to ensure it's loaded on client
    import('lightweight-charts').then(({ createChart, ColorType, LineSeries }) => {
      if (!isSubscribed || !chartContainerRef.current) return;

      chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        rightPriceScale: {
          borderColor: '#374151',
        },
        timeScale: {
          borderColor: '#374151',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const lineSeries = chart.addSeries(LineSeries, {
        color: color,
        lineWidth: 2,
      });

      // Convert data to lightweight-charts format
      const formattedData = data.map(item => ({
        time: item.date,
        value: item.price,
      }));

      lineSeries.setData(formattedData);

      // Fit content to show all data
      chart.timeScale().fitContent();

      setIsLoading(false);

      // Handle resize
      const resizeHandler = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      handleResize = resizeHandler;
      window.addEventListener('resize', resizeHandler);
    });

    return () => {
      isSubscribed = false;
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (chart) {
        chart.remove();
      }
    };
  }, [data, color, height]);

  return (
    <div className="w-full relative" style={{ minHeight: height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}

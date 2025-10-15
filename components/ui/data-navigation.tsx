'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface DataNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const tabs = [
  { id: 'constanta', label: 'CONSTANTA PORT' },
  { id: 'daily-prices', label: 'DAILY PRICES' },
  { id: 'cot', label: 'COT CFTC' },
  { id: 'dg-agri', label: 'DG AGRI' },
];

export function DataNavigation({ activeTab, onTabChange, className }: DataNavigationProps) {
  return (
    <div className={cn("flex items-center gap-8 border-b border-slate-700/50 mb-8", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-4 text-base font-semibold tracking-wide transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-white border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

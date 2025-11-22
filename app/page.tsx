'use client';

import { useState } from 'react';
import { DashboardLayout, DashboardPanel } from '@/components/layout/DashboardLayout';
import { ReportsSection } from '@/components/reports/ReportsSection';
import { ConstantaPortPanel } from '@/components/panels/ConstantaPortPanel';
import { DailyPricesPanel } from '@/components/panels/DailyPricesPanel';
import { COTPanel } from '@/components/panels/COTPanel';
import { DGAgriPanel } from '@/components/panels/DGAgriPanel';
import { EUWeeklyTradePanel } from '@/components/panels/EUWeeklyTradePanel';
import { DataNavigation } from '@/components/ui/data-navigation';
import { Separator } from '@/components/ui/separator';
import { DashboardSubscriptionOverlay } from '@/components/subscriptions/DashboardSubscriptionOverlay';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function Home() {
  const [activeTab, setActiveTab] = useState('constanta');

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'constanta':
        return <ConstantaPortPanel />;
      case 'daily-prices':
        return <DailyPricesPanel />;
      case 'cot':
        return <COTPanel />;
      case 'dg-agri':
        return (
          <div className="space-y-6">
            <EUWeeklyTradePanel />
            <DGAgriPanel />
          </div>
        );
      default:
        return <ConstantaPortPanel />;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-12">

          {/* Commodity Reports Section */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">COMMODITY REPORTS</h2>
            <ReportsSection />
          </section>

          {/* Services Section with Tabs */}
          <section>
            <div className="mb-6">
            </div>
            
            {/* Navigation Tabs */}
            <DataNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
            
            {/* Active Panel */}
          <DashboardPanel>
            {renderActivePanel()}
          </DashboardPanel>
        </section>
        </div>
        <DashboardSubscriptionOverlay />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

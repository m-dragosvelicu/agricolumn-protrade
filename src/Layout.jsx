import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "lucide-react";
import { Report } from "@/entities/Report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const navigationItems = [
  {
    title: "PORT CONSTANTA",
    url: createPageUrl("PortConstanta"),
  },
  {
    title: "Daily Prices", 
    url: createPageUrl("DailyPrices"),
  },
  {
    title: "COT CFTC",
    url: createPageUrl("COTCFTC"),
  },
  {
    title: "DG AGRI",
    url: createPageUrl("DGAgri"),
  },
];

export default function Layout() {
  const location = useLocation();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const result = await Report.filter({ is_featured: true }, "-created_date", 3);
      setReports(result);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">
              PRO <span className="text-yellow-500">TRADE</span>
            </h1>
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {/* Commodity Reports Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">COMMODITY REPORTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["WHEAT", "CORN", "SOYBEAN"].map((commodity) => {
              const report = reports.find(r => r.commodity_type === commodity);
              return (
                <Card key={commodity} className="bg-slate-800/50 border border-slate-700/50 rounded-lg shadow-lg overflow-hidden">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <CardTitle className="text-white font-bold text-lg tracking-wide">{commodity}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-slate-400 text-sm mb-4 h-24 line-clamp-6">
                      {report?.content || `Sample report content for ${commodity}. The quick brown fox jumps over the lazy dog. This text is a placeholder and will be replaced with actual report data.`}
                    </p>
                    <a href="#" className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold transition-colors">
                      Read more →
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Services Section with Tabs */}
        <section>
          <div className="flex items-center gap-8 border-b border-slate-700/50 mb-8">
            {navigationItems.map((item) => (
              <Link 
                key={item.title}
                to={item.url}
                className={`py-4 text-base font-semibold tracking-wide transition-colors duration-200 border-b-2 ${
                  location.pathname === item.url 
                    ? 'text-white border-yellow-500' 
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Dynamic Content Area */}
          <div>
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}

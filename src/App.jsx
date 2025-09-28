import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import PortConstantaPage from "@/pages/PortConstanta";
import DailyPricesPage from "@/pages/DailyPrices";
import COTCFTCPage from "@/pages/COTCFTC";
import DGAgriPage from "@/pages/DGAgri";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/port-constanta" replace />} />
          <Route path="/port-constanta" element={<PortConstantaPage />} />
          <Route path="/daily-prices" element={<DailyPricesPage />} />
          <Route path="/cot-cftc" element={<COTCFTCPage />} />
          <Route path="/dg-agri" element={<DGAgriPage />} />
          <Route path="*" element={<Navigate to="/port-constanta" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

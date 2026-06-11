"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // ✅ PERBAIKAN 1: Tambahkan dark mode background & cegah horizontal scroll
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Wrapper */}
      {/* ✅ PERBAIKAN 2: Ubah ml-64 menjadi ml-72 agar pas dengan Sidebar terbaru (w-72) */}
      <div className="flex flex-1 flex-col lg:ml-72">
        {/* Header */}
        <Header onMenu={() => setSidebarOpen(true)} />

        {/* Page Content */}
        {/* ✅ PERBAIKAN 3: Padding responsif untuk mobile, tablet, dan desktop */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

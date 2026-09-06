'use client';

import { useState } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-poppins">
      {/* Header wrapper given z-40 so the logo overlaps main content on PC, but allows z-50 mobile sidebar to overlap it */}
      <div className="z-40 relative">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      </div>
      {/* Removed relative z-0 so this doesn't trap the mobile sidebar's z-index */}
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        {/* Allow whole main area to scroll on mobile, keep constrained on PC */}
        <main className="flex-1 px-4 sm:px-6 md:px-10 pt-6 md:pt-10 pb-6 flex flex-col h-full overflow-y-auto md:overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

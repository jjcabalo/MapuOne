'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if we just logged in for the first time
    if (typeof window !== 'undefined') {
      const justLoggedIn = localStorage.getItem('justLoggedIn');
      if (justLoggedIn === 'true') {
        setShowSplash(true);
        // Remove it so it doesn't trigger on new tabs or refreshes
        localStorage.removeItem('justLoggedIn');

        // Play animation for 2.5s then fade out
        setTimeout(() => {
          setIsFadingOut(true);
          // Remove from DOM after fade out transition (500ms)
          setTimeout(() => {
            setShowSplash(false);
          }, 500);
        }, 2500);
      }
    }

    // Check if the user is authenticated on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkSession();

    // Subscribe to auth state changes (automatically catches logouts)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex flex-col h-screen print:h-auto overflow-hidden print:overflow-visible bg-white font-poppins print:block">
      
      {/* Premium Loading Splash Screen */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="relative flex flex-col items-center">
            {/* Pulsing logo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#E50000] rounded-full blur-2xl opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
              <img 
                src="/assets/logo/mapuone_logo.png" 
                alt="MapúOne Loading" 
                className="w-32 h-auto object-contain relative z-10 drop-shadow-lg" 
              />
            </div>
            
            {/* Elegant loading text */}
            <h1 className="text-4xl font-black text-black tracking-[0.1em] uppercase">
              MapúOne
            </h1>
            
            {/* Smooth progress bar */}
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-[#E50000] rounded-full animate-loader"></div>
            </div>
            <p className="text-[#E50000] font-bold text-xs uppercase tracking-widest mt-4 animate-pulse">
              Authenticating...
            </p>
          </div>

          <style jsx>{`
            @keyframes typing {
              from { width: 0; }
              to { width: 100%; }
            }
            @keyframes loader {
              0% { width: 0%; transform: translateX(-100%); }
              50% { width: 100%; transform: translateX(0%); }
              100% { width: 100%; transform: translateX(100%); }
            }
            .animate-typing {
              animation: typing 1.5s steps(30, end) forwards;
            }
            .animate-loader {
              animation: loader 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          `}</style>
        </div>
      )}

      {/* Header wrapper given z-40 so the logo overlaps main content on PC, but allows z-50 mobile sidebar to overlap it */}
      <div className="z-40 relative print-hide">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      </div>
      {/* Removed relative z-0 so this doesn't trap the mobile sidebar's z-index */}
      <div className="flex flex-1 w-full overflow-hidden print:overflow-visible print:h-auto print:block print-content">
        <div className="print-hide h-full">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
        {/* Allow whole main area to scroll on mobile, keep constrained on PC */}
        <main className="flex-1 px-4 sm:px-6 md:px-10 pt-6 md:pt-10 pb-6 flex flex-col h-full overflow-y-auto md:overflow-hidden print:overflow-visible print:block print:h-auto print-content">
          {children}
        </main>
      </div>
    </div>
  );
}

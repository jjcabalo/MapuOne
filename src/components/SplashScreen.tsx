'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { supabase } from '@/lib/supabase';

export default function SplashScreen() {
  const pathname = usePathname();
  
  // Initialize to true (unless on an excluded path) so the splash screen
  // covers the UI on the initial HTML load, preventing the UI from showing first.
  const [show, setShow] = useState(() => {
    const noSplashPaths = [
      '/forgot-password', 
      '/reset-password', 
      '/update-password', 
      '/change-password',
      '/user',
      '/admin'
    ];
    return !noSplashPaths.some(p => pathname?.startsWith(p));
  });

  const [isClient, setIsClient] = useState(false);
  const [isInstantHide, setIsInstantHide] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const hasVisited = sessionStorage.getItem('hasVisitedMapuOne');
    
    // Check if the user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session || hasVisited) {
        setIsInstantHide(true);
        setShow(false);
      } else {
        sessionStorage.setItem('hasVisitedMapuOne', 'true');
      }
    });
  }, []);

  useEffect(() => {
    if (show && isClient) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, isClient]);

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            id="mapuone-splash-screen"
            suppressHydrationWarning
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isInstantHide ? 0 : 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                className="text-5xl sm:text-7xl md:text-9xl font-black text-black tracking-widest"
              >
                MAPÚ<span className="text-[#F50B0B]">ONE</span>
              </motion.h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1, duration: 0.8, ease: 'easeInOut' }}
                className="h-1 sm:h-2 bg-[#F50B0B] mt-4 rounded-full"
              />
            </motion.div>
          </motion.div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (sessionStorage.getItem('hasVisitedMapuOne')) {
                  document.getElementById('mapuone-splash-screen').style.display = 'none';
                }
              `
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

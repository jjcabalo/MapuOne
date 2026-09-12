'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { X, ChevronLeft } from 'lucide-react';
import PopupDialog from '@/components/shared/PopupDialog';

const userRoutes = [
  { name: 'DASHBOARD', path: '/user/dashboard', icon: '/assets/icons/dashboard-icon.png' },
  { name: 'FILE COMPLAINT', path: '/user/file-complaint', icon: '/assets/icons/file-complaint_icon.png' },
  { name: 'MY CASES', path: '/user/my-cases', icon: '/assets/icons/my-cases_icon.png' },
  { name: 'NOTIFICATION', path: '/user/notifications', icon: '/assets/icons/notification_icon.png' },
];

const adminRoutes = [
  { name: 'CASE QUEUE', path: '/admin/queue', icon: '/assets/icons/case-queue_icon.png' },
  { name: 'MY TICKETS', path: '/admin/my-tickets', icon: '/assets/icons/my-cases_icon.png' },
  { name: 'REPORTS', path: '/admin/reports', icon: '/assets/icons/reports_icon.png' },
  { name: 'SETTINGS', path: '/admin/settings', icon: '/assets/icons/setings_icon.png' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith('/admin');
  const routes = isAdmin ? adminRoutes : userRoutes;
  
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    if (onClose) onClose();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[50] md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[60] md:z-0 
        w-[280px] md:w-[300px] bg-white flex flex-col 
        pt-6 md:pt-20 pb-10 px-6 gap-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Mobile Header with Logo & Close Button (Hidden on PC) */}
        <div className="md:hidden flex flex-col items-center mb-4 relative pb-6 border-b border-gray-100">
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-black rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src="/assets/logo/mapuone_logo.png" 
            alt="MapúOne Logo" 
            className="w-[100px] h-auto object-contain mb-3 drop-shadow-md" 
          />
          <h1 className="text-black text-3xl font-black leading-none tracking-wide">MapúOne</h1>
          <h2 className="text-primary text-sm font-bold leading-none mt-1">Mapua University</h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-4 overflow-y-auto mt-4">
          
          {pathname === '/user/profile' ? (
            <>
              <Link 
                href="/user/dashboard"
                onClick={onClose}
                className="flex items-center gap-6 px-6 py-5 rounded-xl bg-black hover:bg-gray-900 transition-all font-bold"
              >
                <ChevronLeft className="w-6 h-6 text-[#FFCC00]" />
                <span className="text-sm tracking-widest uppercase text-[#E50000]">BACK</span>
              </Link>

              <button 
                onClick={handleLogoutClick}
                className="flex items-center gap-6 px-6 py-5 rounded-xl bg-black hover:bg-gray-900 transition-all font-bold mt-2"
              >
                <div className="w-6 flex justify-center">
                  <img src="/assets/icons/logout_icon.png" alt="Log Out" className="max-w-full max-h-5 object-contain" />
                </div>
                <span className="text-sm tracking-widest uppercase text-[#E50000]">LOG OUT</span>
              </button>
            </>
          ) : (
            <>
              {routes.map((route) => {
                const isActive = pathname === route.path || pathname.startsWith(route.path + '/');
                
                return (
                  <Link 
                    key={route.name}
                    href={route.path}
                    onClick={onClose}
                    className={`flex items-center gap-6 px-6 py-5 rounded-xl transition-all font-bold ${
                      isActive 
                        ? 'bg-primary text-black' 
                        : 'bg-black text-primary hover:bg-gray-900'
                    }`}
                  >
                    <div className="w-6 flex justify-center">
                      <img 
                        src={route.icon} 
                        alt={route.name} 
                        className={`max-w-full max-h-5 object-contain ${isActive ? 'brightness-0' : ''}`} 
                      />
                    </div>
                    <span className="text-sm tracking-widest uppercase">{route.name}</span>
                  </Link>
                );
              })}

              <button 
                onClick={handleLogoutClick}
                className="flex items-center gap-6 px-6 py-5 rounded-xl bg-black text-primary hover:bg-gray-900 transition-all font-bold mt-2"
              >
                <div className="w-6 flex justify-center">
                  <img src="/assets/icons/logout_icon.png" alt="Logout" className="max-w-full max-h-5 object-contain" />
                </div>
                <span className="text-sm tracking-widest uppercase">LOG OUT</span>
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Logout Confirmation Dialog */}
      <PopupDialog 
        isOpen={showLogoutDialog}
        hideHeader={true}
        onClose={() => setShowLogoutDialog(false)}
        maxWidth="max-w-md"
        footer={
          <>
            <button 
              onClick={() => setShowLogoutDialog(false)}
              className="px-6 py-3 border-2 border-black text-black hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors uppercase"
            >
              Cancel
            </button>
            <button 
              onClick={confirmLogout}
              className="px-6 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase"
            >
              Yes, Log Out
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center pt-4">
          <div className="w-24 h-24 bg-[#FFBFC4] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <img src="/assets/icons/logout_icon.png" alt="Logout" className="w-10 h-10 object-contain ml-2 brightness-0 hue-rotate-180" style={{ filter: 'invert(16%) sepia(87%) saturate(5830%) hue-rotate(352deg) brightness(97%) contrast(116%)' }} />
          </div>
          <h2 className="text-3xl font-black text-black mb-3 text-center">Confirm Logout</h2>
          <p className="text-sm text-gray-700 text-center max-w-sm mb-4 leading-relaxed">
            Are you sure you want to end your session? You will need to log back in to manage your cases.
          </p>
        </div>
      </PopupDialog>
    </>
  );
}

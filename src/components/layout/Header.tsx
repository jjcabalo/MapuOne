'use client';

import { Bell, Search, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 relative text-black hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-6 h-6" />
          {/* Notification Badge */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-black">John Doe</p>
            <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'Student'}</p>
          </div>
          <UserCircle className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    </header>
  );
}

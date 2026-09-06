'use client';

import { UserCircle, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="h-20 md:h-32 bg-black flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-md">
      {/* Mobile Menu Button & Desktop Logo */}
      <div className="flex items-center gap-4">
        
        {/* Mobile Hamburger (hidden on md) */}
        <button 
          onClick={onMenuClick}
          className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-8 h-8" />
        </button>

        {/* Desktop Logo (hidden on mobile) */}
        <Link href={isAdmin ? "/admin/queue" : "/user/dashboard"} className="hidden md:flex items-center relative pl-[190px]">
          {/* Absolutely positioned giant logo */}
          <img 
            src="/assets/logo/mapuone_logo.png" 
            alt="MapúOne Logo" 
            className="absolute -top-2 -left-2 w-[180px] h-auto z-40 drop-shadow-xl hover:scale-105 transition-transform" 
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-white text-4xl md:text-5xl font-black leading-none tracking-wide">MapúOne</h1>
            <h2 className="text-accent text-base md:text-lg font-bold leading-none mt-1.5 md:mt-2">Mapua University</h2>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center pr-2 md:pr-4 z-40 hover:opacity-80 transition-opacity cursor-pointer">
        {isAdmin ? (
          <div className="bg-[#E50000] text-white text-xs font-bold uppercase tracking-wider px-8 py-2.5 rounded shadow-sm">
            Admin
          </div>
        ) : (
          <Link href="/user/profile">
            <UserCircle className="w-9 h-9 md:w-10 md:h-10 text-white" />
          </Link>
        )}
      </div>
    </header>
  );
}

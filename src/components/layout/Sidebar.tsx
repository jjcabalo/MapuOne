'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Bell, 
  User, 
  LogOut,
  List,
  BarChart,
  Settings
} from 'lucide-react';

const userRoutes = [
  { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
  { name: 'File Complaint', path: '/user/file-complaint', icon: FileText },
  { name: 'My Cases', path: '/user/my-cases', icon: FolderOpen },
  { name: 'Notifications', path: '/user/notifications', icon: Bell },
  { name: 'My Profile', path: '/user/profile', icon: User },
];

const adminRoutes = [
  { name: 'Case Queue', path: '/admin/queue', icon: List },
  { name: 'Reports', path: '/admin/reports', icon: BarChart },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const routes = isAdmin ? adminRoutes : userRoutes;

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">MapuOne</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-4">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.path;
            
            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{route.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex w-full items-center gap-3 px-4 py-3 text-black hover:bg-gray-100 rounded-lg transition-colors">
          <LogOut className="w-5 h-5 text-primary" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

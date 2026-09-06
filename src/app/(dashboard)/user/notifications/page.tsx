'use client';

import { useState } from 'react';
import { MessageSquare, Clock, Check } from 'lucide-react';

type NotificationType = 'message' | 'status_progress' | 'status_alert' | 'status_resolved';

interface Notification {
  id: number;
  caseId: string;
  message: string;
  date: string;
  type: NotificationType;
  read: boolean;
  group: 'TODAY' | 'EARLIER';
}

const mockNotifications: Notification[] = [
  { id: 1, caseId: 'MU-2026-111', message: 'Admin requested clarification: "Please attach a photo of the recorded grade sheet."', date: 'Aug 10, 2026', type: 'message', read: false, group: 'TODAY' },
  { id: 2, caseId: 'MU-2026-000', message: 'Status changed to In Progress — assigned to Facilities Management.', date: 'Aug 10, 2026', type: 'status_progress', read: false, group: 'TODAY' },
  { id: 3, caseId: 'MU-2026-333', message: 'Case marked Pending Response — a reply is needed to avoid delay.', date: 'Aug 10, 2026', type: 'status_alert', read: false, group: 'TODAY' },
  { id: 4, caseId: 'MU-2026-222', message: 'Case resolved and closed by IT / Technical Support.', date: 'Jul 25, 2026', type: 'status_resolved', read: true, group: 'EARLIER' },
  { id: 5, caseId: 'MU-2026-444', message: 'Status changed to In Progress — assigned to Facilities Management.', date: 'Jul 9, 2026', type: 'status_progress', read: true, group: 'EARLIER' },
];

const filters = ['ALL', 'UNREAD', 'STATUS UPDATE', 'MESSAGES'];

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [notifications, setNotifications] = useState(mockNotifications);

  // Filter Logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.read;
    if (activeFilter === 'STATUS UPDATE') return n.type.startsWith('status');
    if (activeFilter === 'MESSAGES') return n.type === 'message';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'status_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'status_alert':
        return (
          <div className="w-5 h-5 bg-[#FFBFC4] rounded-full flex items-center justify-center">
            <span className="text-white font-black text-xs">!</span>
          </div>
        );
      case 'status_resolved':
        return <Check className="w-5 h-5 text-[#10B981]" strokeWidth={3} />;
      default:
        return null;
    }
  };

  // Grouping
  const todayNotifications = filteredNotifications.filter(n => n.group === 'TODAY');
  const earlierNotifications = filteredNotifications.filter(n => n.group === 'EARLIER');

  return (
    <div className="flex flex-col h-full font-poppins w-full">
      
      {/* Title Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide mb-1">
          Notifications
        </h1>
        <p className="text-black text-sm md:text-base mb-6">
          Stay on top of every case update
        </p>

        {/* Filters and Mark Read */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-colors ${
                  activeFilter === filter
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={markAllAsRead}
            className="px-6 py-2 border border-gray-300 rounded-lg text-xs font-bold text-black hover:bg-gray-50 transition-colors uppercase"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Scrollable Notifications List */}
      <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar pb-10">
        
        {todayNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-black text-xs font-black uppercase tracking-wide mb-4">TODAY</h2>
            <div className="flex flex-col gap-3">
              {todayNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`border border-gray-300 rounded-lg p-5 flex items-center justify-between gap-4 transition-colors ${
                    notification.read ? 'bg-[#EEEEEE]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                      <span className="font-bold text-black text-sm">{notification.caseId}</span>
                      <span className="text-gray-700 text-sm hidden md:inline-block">—</span>
                      <p className="text-black text-sm">{notification.message}</p>
                    </div>
                  </div>
                  <span className="font-bold text-black text-xs flex-shrink-0">{notification.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {earlierNotifications.length > 0 && (
          <div>
            <h2 className="text-black text-xs font-black uppercase tracking-wide mb-4">EARLIER</h2>
            <div className="flex flex-col gap-3">
              {earlierNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`border border-gray-300 rounded-lg p-5 flex items-center justify-between gap-4 transition-colors ${
                    notification.read ? 'bg-[#EEEEEE]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                      <span className="font-bold text-black text-sm">{notification.caseId}</span>
                      <span className="text-gray-700 text-sm hidden md:inline-block">—</span>
                      <p className="text-black text-sm">{notification.message}</p>
                    </div>
                  </div>
                  <span className="font-bold text-black text-xs flex-shrink-0">{notification.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
            You're all caught up! No notifications to show.
          </div>
        )}
      </div>

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  complaintId: string | null;
  caseId: string;
  message: string;
  date: string;
  type: string;
  read: boolean;
  group: 'TODAY' | 'EARLIER';
}

const filters = ['ALL', 'UNREAD', 'STATUS UPDATE', 'MESSAGES'];

export default function NotificationsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          is_read,
          created_at,
          complaint_id,
          complaints(ticket_number)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (data) {
        const formatted = data.map(d => {
          const createdAt = new Date(d.created_at);
          return {
            id: d.id,
            complaintId: d.complaint_id,
            caseId: d.complaints ? `MU-${createdAt.getFullYear()}-${String((d.complaints as any).ticket_number).padStart(3, '0')}` : 'SYS',
            message: d.message,
            date: createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            type: (d.title || '').toLowerCase().includes('message') ? 'message' :
                  (d.message || '').toLowerCase().includes('resolved') ? 'resolved' :
                  (d.message || '').toLowerCase().includes('in progress') ? 'progress' :
                  (d.message || '').toLowerCase().includes('pending response') ? 'pending' : 'update',
            read: d.is_read,
            group: createdAt.toDateString() === new Date().toDateString() ? 'TODAY' : 'EARLIER'
          };
        }) as Notification[];
        setNotifications(formatted);
      }
      setIsLoading(false);
    };
    
    fetchNotifications();

    const notifChannel = supabase.channel('user-notifications-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.read;
    if (activeFilter === 'STATUS UPDATE') return n.type !== 'message';
    if (activeFilter === 'MESSAGES') return n.type === 'message';
    return true;
  });

  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n));
      }
    }
    
    if (notification.complaintId) {
      router.push(`/user/my-cases?caseId=${notification.complaintId}`);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'message') return <MessageSquare className="w-6 h-6 text-[#6B9DF2]" strokeWidth={2} />;
    if (type === 'progress') return <Clock className="w-6 h-6 text-[#E2BC3C]" strokeWidth={2} />;
    if (type === 'resolved') return <Check className="w-6 h-6 text-[#24CC6A]" strokeWidth={3} />;
    
    // Default alert style (pending response, priority change, etc.)
    return (
      <div className="w-6 h-6 bg-[#FFC0C5] rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">!</span>
      </div>
    );
  };

  const todayNotifications = filteredNotifications.filter(n => n.group === 'TODAY');
  const earlierNotifications = filteredNotifications.filter(n => n.group === 'EARLIER');

  return (
    <div className="flex flex-col h-full font-poppins w-full">
      
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide mb-1">
          Notifications
        </h1>
        <p className="text-black text-sm md:text-base mb-6">
          Stay on top of every case update
        </p>

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

      <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar pb-10">
        
        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-medium uppercase tracking-widest">
            Loading Notifications...
          </div>
        ) : (
          <>
            {todayNotifications.length > 0 && (
              <div className="mb-8">
                <h2 className="text-black text-xs font-black uppercase tracking-wide mb-4">TODAY</h2>
                <div className="flex flex-col gap-3">
                  {todayNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      onClick={() => handleNotificationClick(notification)}
                      className={`border border-gray-300 rounded-lg p-5 flex items-center justify-between gap-4 transition-colors cursor-pointer hover:border-primary ${
                        notification.read ? 'bg-[#EEEEEE]' : 'bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 w-8 flex justify-center mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-black text-sm">{notification.caseId}</span>
                          <p className="text-black text-sm">{notification.message}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-[11px] flex-shrink-0 ml-4 self-start mt-1 whitespace-nowrap">{notification.date}</span>
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
                      onClick={() => handleNotificationClick(notification)}
                      className={`border border-gray-300 rounded-lg p-5 flex items-center justify-between gap-4 transition-colors cursor-pointer hover:border-primary ${
                        notification.read ? 'bg-[#EEEEEE]' : 'bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 w-8 flex justify-center mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-black text-sm">{notification.caseId}</span>
                          <p className="text-black text-sm">{notification.message}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-[11px] flex-shrink-0 ml-4 self-start mt-1 whitespace-nowrap">{notification.date}</span>
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
          </>
        )}
      </div>

    </div>
  );
}

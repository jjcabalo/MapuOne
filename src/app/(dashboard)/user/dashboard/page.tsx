'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Complaint {
  id: string;
  ticket_number: number;
  category: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function UserDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userName, setUserName] = useState<string>('User');
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryStyle = (cat: string) => {
    if (!cat) return 'bg-gray-200 text-gray-800';
    const upper = cat.toUpperCase();
    if (upper.includes('FACILITIES')) return 'bg-[#FFBFC4] text-[#E50000]';
    if (upper.includes('ACADEMIC')) return 'bg-[#9B9BE3] text-white';
    if (upper.includes('IT')) return 'bg-[#5BC0DE] text-white';
    if (upper.includes('STUDENT')) return 'bg-[#95C287] text-white';
    return 'bg-gray-200 text-gray-800';
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch user profile for given name
      const { data: userData } = await supabase
        .from('users')
        .select('first_name')
        .eq('id', session.user.id)
        .single();
      
      if (userData?.first_name) {
        setUserName(userData.first_name);
      }

      const { data } = await supabase
        .from('complaints')
        .select('*')
        .eq('complainant_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (data) setComplaints(data);
      setIsLoading(false);
    };

    fetchData();
  }, []);
  
  const openCount = complaints.filter(c => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROCESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col h-full font-poppins">
      
      {/* Title & Stats (Fixed at top) */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-black text-black mb-8 uppercase tracking-wide">
          Welcome Back, {userName}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Open Card */}
          <div className="bg-[#FFBFC4] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between">
            <span className="font-bold text-lg md:text-xl text-black uppercase z-10">Open</span>
            <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">
              {openCount}
            </span>
          </div>

          {/* In Progress Card */}
          <div className="bg-[#FDF2C8] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between">
            <span className="font-bold text-lg md:text-xl text-black uppercase z-10">In Progress</span>
            <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">
              {inProgressCount}
            </span>
          </div>

          {/* Resolved Card */}
          <div className="bg-[#D1F0D4] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between">
            <span className="font-bold text-lg md:text-xl text-black uppercase z-10">Resolved</span>
            <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">
              {resolvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Complaints List - Independently Scrollable on PC, native scroll on Mobile */}
      <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500 font-bold uppercase">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="py-10 text-center text-gray-500 font-bold uppercase">No complaints filed yet.</div>
          ) : (
            complaints.slice(0, 10).map((complaint) => {
              const bgStatusColor = 
                complaint.status === 'OPEN' ? 'bg-[#FFBFC4]' : 
                complaint.status === 'IN_PROCESS' ? 'bg-[#FDF2C8]' : 
                complaint.status === 'PENDING_RESPONSE' ? 'bg-[#EBDDD0]' :
                'bg-[#D1F0D4]';

              const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div key={complaint.id} className="flex justify-between items-center py-6 border-b border-gray-200">
                  <div className="flex flex-col gap-2 w-full max-w-[70%]">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-black text-lg md:text-xl tracking-wide shrink-0">
                        MU-{new Date(complaint.created_at).getFullYear()}-{String(complaint.ticket_number).padStart(3, '0')}
                      </span>
                      <h3 className="font-bold text-xl md:text-2xl text-[#4A4A4A] truncate">
                        {complaint.title || `Untitled Complaint`}
                      </h3>
                    </div>
                    {complaint.description && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1 mb-2">
                        {complaint.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getCategoryStyle(complaint.category)}`}>
                        {complaint.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-400 font-bold tracking-widest uppercase">
                        Filed: {formattedDate}
                      </span>
                    </div>
                  </div>
                  <div className={`px-8 py-2 rounded ${bgStatusColor} text-black font-bold text-xs uppercase text-center min-w-[140px]`}>
                    {complaint.status.replace('_', ' ')}
                  </div>
                </div>
              );
            })
          )}
          
          <div className="flex justify-center mt-8 mb-4">
            <Link 
              href="/user/my-cases"
              className="px-8 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide shadow-md"
            >
              See All Complaints
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

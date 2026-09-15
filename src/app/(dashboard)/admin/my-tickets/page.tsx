'use client';

import { useState, useEffect } from 'react';
import { UserCircle, AlertCircle } from 'lucide-react';
import PopupDialog from '@/components/shared/PopupDialog';
import { supabase } from '@/lib/supabase';

export default function AdminMyTicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  
  const [cases, setCases] = useState<any[]>([]);
  const [handlers, setHandlers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  const getCategoryStyle = (cat: string) => {
    if (!cat) return 'bg-gray-200 text-gray-800';
    const upper = cat.toUpperCase();
    if (upper.includes('FACILITIES')) return 'bg-[#FFBFC4] text-[#E50000]';
    if (upper.includes('ACADEMIC')) return 'bg-[#9B9BE3] text-white';
    if (upper.includes('IT')) return 'bg-[#5BC0DE] text-white';
    if (upper.includes('STUDENT')) return 'bg-[#95C287] text-white';
    return 'bg-gray-200 text-gray-800';
  };

  const getPriorityStyle = (prio: string) => {
    switch (prio?.toUpperCase()) {
      case 'HIGH': return 'bg-[#FFBFC4] text-[#E50000]';
      case 'MEDIUM': return 'bg-[#FFEFB3] text-[#997A00]';
      case 'LOW': return 'bg-[#D1F0D4] text-[#059669]';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusStyle = (stat: string) => {
    switch (stat?.toUpperCase().replace(' ', '_')) {
      case 'OPEN': return 'bg-[#FFBFC4] text-black';
      case 'IN_PROCESS': return 'bg-[#FDF2C8] text-black';
      case 'PENDING_RESPONSE': return 'bg-[#EBDDD0] text-black';
      case 'RESOLVED': return 'bg-[#D1F0D4] text-black';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [priority, setPriority] = useState('HIGH');
  const [assigned, setAssigned] = useState('UNASSIGNED');
  const [status, setStatus] = useState('IN_PROCESS');

  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveComments, setResolveComments] = useState({ internal: '', external: '' });
  const [confirmSaveModalOpen, setConfirmSaveModalOpen] = useState(false);
  
  const [comments, setComments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 4000);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchData();

    const complaintsChannel = supabase.channel('admin-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(complaintsChannel);
    };
  }, []);

  useEffect(() => {
    if (!selectedCase) return;

    const caseChannel = supabase.channel(`admin-case-${selectedCase.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `complaint_id=eq.${selectedCase.id}` }, () => {
        fetchComments(selectedCase.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_activities', filter: `complaint_id=eq.${selectedCase.id}` }, () => {
        fetchActivities(selectedCase.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(caseChannel);
    };
  }, [selectedCase]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get current user profile
    const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
    setCurrentUserProfile(profile);

    // Fetch handlers for assignment dropdown (even though this is "my tickets", they might reassign)
    const { data: handlerData } = await supabase.from('users').select('*').in('role', ['HANDLER', 'ADMIN']);
    if (handlerData) setHandlers(handlerData);

    const { data, error } = await supabase.from('complaints').select(`
      *,
      users!complainant_id(first_name, last_name),
      complaint_attachments(*)
    `).order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching my tickets:", error);
      alert("Error fetching my tickets. If you see 0 tickets, check your Supabase Row Level Security (RLS) policies to ensure HANDLER role is allowed to SELECT.");
    }

    if (data) {
      // Use JS filtering to ensure it strictly matches without PostgREST quirks
      const filteredData = data.filter(d => d.assigned_handler_id === session.user.id);
      
      const formatted = filteredData.map(d => ({
        id: d.id,
        complaint: d.title,
        description: d.description,
        filedBy: d.users ? `${d.users.first_name[0]}. ${d.users.last_name}` : 'Unknown',
        date: new Date(d.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        assignedId: d.assigned_handler_id,
        assigned: d.assigned_handler_id ? 'ASSIGNED' : 'UNASSIGNED',
        status: d.status.replace('_', ' '),
        rawStatus: d.status,
        category: d.category.replace('_', ' '),
        rawCategory: d.category,
        priority: d.priority,
        matched_keyword: d.matched_keyword,
        created_at: d.created_at,
        ticket_number: d.ticket_number,
        attachments: d.complaint_attachments || []
      }));
      
      // Update assigned names
      const populated = formatted.map(f => {
        if (f.assignedId) {
           // We already know it's assigned to the current user, but let's map it anyway
          const h = handlerData?.find(h => h.id === f.assignedId);
          if (h) f.assigned = `${h.first_name[0]}. ${h.last_name}`;
        }
        return f;
      });
      
      setCases(populated);

      // Live-update currently selected case details if already open
      setSelectedCase((prev: any) => {
        if (!prev) return prev;
        const updatedTarget = populated.find((c: any) => c.id === prev.id);
        return updatedTarget ? updatedTarget : prev;
      });
    }
    setIsLoading(false);
  };

  const fetchComments = async (caseId: string) => {
    const { data } = await supabase.from('comments').select('*, users(first_name, last_name, role, department)').eq('complaint_id', caseId).order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const fetchActivities = async (caseId: string) => {
    const { data } = await supabase.from('case_activities').select('*').eq('complaint_id', caseId).order('created_at', { ascending: true });
    if (data) setActivities(data);
  };

  const handleCaseSelect = (c: any) => {
    setSelectedCase(c);
    setPriority(c.priority);
    setAssigned(c.assignedId || 'UNASSIGNED');
    setStatus(c.rawStatus);
    fetchComments(c.id);
    fetchActivities(c.id);
  };

  const handleUpdate = async (field: string, value: string) => {
    if (!selectedCase) return;
    
    // Optimistic UI update
    if (field === 'priority') setPriority(value);
    if (field === 'assigned_handler_id') setAssigned(value);
    if (field === 'status') setStatus(value);
    
    await supabase.from('complaints').update({ [field]: value }).eq('id', selectedCase.id);
    fetchData(); // Refresh list to get accurate assigned names, or in case ticket is reassigned away
    
    if (field === 'assigned_handler_id' && value !== currentUserProfile.id) {
       // Ticket reassigned away, so deselect it since it's no longer "my ticket"
       setSelectedCase(null);
    }
  };

  const handleResolve = async () => {
    if (!selectedCase) return;
    
    // Add external comment
    if (resolveComments.external) {
      await supabase.from('comments').insert({
        complaint_id: selectedCase.id,
        user_id: currentUserProfile.id,
        message: `RESOLUTION: ${resolveComments.external}`
      });
    }
    
    const updates: any = {
      status: 'RESOLVED',
      resolved_at: new Date().toISOString()
    };

    if (currentUserProfile?.role === 'ADMIN') {
      updates.priority = priority;
      updates.assigned_handler_id = assigned === 'UNASSIGNED' ? null : assigned;
    }

    const { error } = await supabase.from('complaints').update(updates).eq('id', selectedCase.id);
    if (error) alert("Error resolving case: " + error.message);
    
    setResolveModalOpen(false);
    fetchData();
    setSelectedCase(null);
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedCase || !currentUserProfile) return;
    
    const { error } = await supabase.from('comments').insert({
      complaint_id: selectedCase.id,
      user_id: currentUserProfile.id,
      message: newComment
    });
      
    if (!error) {
      setNewComment('');
      fetchComments(selectedCase.id);
    } else {
      alert("Error sending message: " + error.message + " (Check RLS policies on 'comments' table)");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeStatusFilter]);

  const baseCases = cases.filter(c => 
    c.complaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.filedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCases = activeStatusFilter 
    ? baseCases.filter(c => c.status === activeStatusFilter.replace('_', ' ')) 
    : baseCases.filter(c => c.status !== 'RESOLVED');
    
  const totalPages = Math.ceil(filteredCases.length / rowsPerPage);
  const paginatedCases = filteredCases.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const openCount = baseCases.filter(c => c.status === 'OPEN').length;
  const inProgressCount = baseCases.filter(c => c.status === 'IN PROCESS').length;
  const pendingCount = baseCases.filter(c => c.status === 'PENDING RESPONSE').length;
  const resolvedCount = baseCases.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col h-auto md:h-full font-poppins w-full min-h-full shrink-0 relative">
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border border-gray-200 shadow-xl rounded-lg px-6 py-4 flex items-center gap-3 transition-all duration-500 ease-in-out transform ${isToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
        <AlertCircle className="w-5 h-5 text-[#E50000]" />
        <p className="text-sm font-bold text-gray-800">{toastMessage}</p>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide">
            {selectedCase ? 'Case Details' : 'My Tickets'}
          </h1>
          {selectedCase && (
            <button 
              onClick={() => setSelectedCase(null)}
              className="text-gray-600 hover:text-black text-sm mt-2 flex items-center gap-1 transition-colors"
            >
              ← Back to My Tickets
            </button>
          )}
        </div>
        
        {!selectedCase && (
          <input
            type="text"
            placeholder="Search your assigned cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black placeholder-gray-400 shadow-sm"
          />
        )}
      </div>

      {!selectedCase ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 flex-shrink-0">
            <div onClick={() => setActiveStatusFilter(activeStatusFilter === 'OPEN' ? null : 'OPEN')} className={`bg-[#FFBFC4] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer transition-all ${activeStatusFilter === 'OPEN' ? 'ring-4 ring-black scale-[1.02]' : 'hover:scale-105'}`}>
              <span className="font-bold text-xl text-black uppercase z-10">Open</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">{openCount}</span>
            </div>
            <div onClick={() => setActiveStatusFilter(activeStatusFilter === 'IN_PROCESS' ? null : 'IN_PROCESS')} className={`bg-[#FDF2C8] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer transition-all ${activeStatusFilter === 'IN_PROCESS' ? 'ring-4 ring-black scale-[1.02]' : 'hover:scale-105'}`}>
              <span className="font-bold text-xl text-black uppercase z-10 w-28 md:w-auto leading-tight md:leading-normal">In Progress</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">{inProgressCount}</span>
            </div>
            <div onClick={() => setActiveStatusFilter(activeStatusFilter === 'PENDING_RESPONSE' ? null : 'PENDING_RESPONSE')} className={`bg-[#EBDDD0] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer transition-all ${activeStatusFilter === 'PENDING_RESPONSE' ? 'ring-4 ring-black scale-[1.02]' : 'hover:scale-105'}`}>
              <span className="font-bold text-xl text-black uppercase z-10">Pending</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">{pendingCount}</span>
            </div>
            <div onClick={() => setActiveStatusFilter(activeStatusFilter === 'RESOLVED' ? null : 'RESOLVED')} className={`bg-[#D1F0D4] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer transition-all ${activeStatusFilter === 'RESOLVED' ? 'ring-4 ring-black scale-[1.02]' : 'hover:scale-105'}`}>
              <span className="font-bold text-xl text-black uppercase z-10">Resolved</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">{resolvedCount}</span>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-visible md:overflow-auto custom-scrollbar pb-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-white z-10 before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:border-b-2 before:border-black">
                <tr>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide w-[30%]">Complaint</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center">Category</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center">Filed By</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center">Date</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center">Assigned</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center w-[15%]">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-10 font-bold">LOADING...</td></tr>
                ) : paginatedCases.map((c) => {
                  let statusBg = 'bg-gray-200';
                  if (c.rawStatus === 'OPEN') statusBg = 'bg-[#FFBFC4]';
                  if (c.rawStatus === 'IN_PROCESS') statusBg = 'bg-[#FDF2C8]';
                  if (c.rawStatus === 'PENDING_RESPONSE') statusBg = 'bg-[#EBDDD0]';
                  if (c.rawStatus === 'RESOLVED') statusBg = 'bg-[#D1F0D4]';

                  return (
                    <tr key={c.id} onClick={() => handleCaseSelect(c)} className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="py-4 px-2 text-sm text-gray-800">
                        <span className="truncate max-w-[200px] block" title={c.complaint}>{c.complaint}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getCategoryStyle(c.rawCategory)}`}>
                          {c.category}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-800 text-center">{c.filedBy}</td>
                      <td className="py-4 px-2 text-sm text-gray-800 text-center">{c.date}</td>
                      <td className="py-4 px-2 text-sm text-gray-800 text-center">{c.assigned}</td>
                      <td className="py-4 px-2 text-center flex justify-center items-center h-full">
                        <span className={`w-full max-w-[120px] px-3 py-1.5 ${statusBg} text-black text-[10px] font-bold uppercase tracking-wider text-center block shadow-sm`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredCases.length === 0 && !isLoading && (
              <div className="text-center py-20 text-gray-500 font-medium">No assigned tickets match your criteria.</div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          <div className="bg-[#F8F6F9] border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md mb-8 mt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
              <div className={`w-full md:w-32 flex-shrink-0 ${getCategoryStyle(selectedCase.category)} text-[10px] font-bold text-center uppercase py-2 px-2 rounded-md tracking-wider leading-tight h-min`}>
                {selectedCase.category.replace(' ', '\n')}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-gray-600 text-xs font-bold mb-1">MU-{new Date(selectedCase.created_at).getFullYear()}-{String(selectedCase.ticket_number).padStart(3, '0')}</span>
                <h3 className="text-black text-sm md:text-base font-black uppercase mb-1">{selectedCase.complaint}</h3>
                <span className="text-gray-500 text-xs font-medium">
                  Filed {selectedCase.date}
                </span>
              </div>
            </div>
            
            <div className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide text-center whitespace-nowrap self-start md:self-center mt-2 md:mt-0 ${
              selectedCase.rawStatus === 'OPEN' ? 'bg-[#FFBFC4] text-black' :
              selectedCase.rawStatus === 'IN_PROCESS' ? 'bg-[#FDF2C8] text-black' :
              selectedCase.rawStatus === 'PENDING_RESPONSE' ? 'bg-[#EBDDD0] text-black' :
              'bg-[#D1F0D4] text-black'
            }`}>
              {selectedCase.status}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
            <div className="flex-1 flex flex-col pl-2 md:pl-4">
              <h2 className="font-black text-black uppercase text-sm tracking-wide mb-6">Case Activity</h2>
              
              <div className="relative border-l-2 border-gray-300 ml-3 md:ml-4 flex flex-col pb-4">
                
                <div className="relative pl-6 pb-10">
                  <div className={`absolute -left-[11px] top-1 w-5 h-5 ${getCategoryStyle(selectedCase.rawCategory).split(' ')[0]} rounded-full border-[3px] border-white shadow-sm`}></div>
                  <p className="font-bold text-black text-sm">
                    CASE OPENED - Routed to {selectedCase.category}
                    {selectedCase.matched_keyword ? ` (“Keyword match: ${selectedCase.matched_keyword.charAt(0).toUpperCase() + selectedCase.matched_keyword.slice(1)}”)` : ''}
                  </p>
                  <p className="text-gray-500 text-[11px] mt-1">{new Date(selectedCase.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  
                  {selectedCase.description && (
                    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedCase.description}</p>
                    </div>
                  )}

                  {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-2">Supporting Documents</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCase.attachments.map((file: any) => (
                          <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-xs font-medium text-gray-800 transition-colors">
                            📄 {file.file_name || 'Document'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {activities.filter(a => !a.action_text.startsWith('CASE OPENED')).map(act => {
                  const getActivityColor = (text: string) => {
                    const lower = text.toLowerCase();
                    if (lower.includes('status changed')) return 'bg-blue-400';
                    if (lower.includes('marked as')) return 'bg-orange-400';
                    if (lower.includes('category changed')) return 'bg-purple-400';
                    if (lower.includes('assigned to') || lower.includes('handler unassigned')) return 'bg-emerald-400';
                    return 'bg-gray-300';
                  };

                  const renderActionText = (text: string) => {
                    if (text.includes('HIGH Priority')) {
                      const parts = text.split('HIGH Priority');
                      return <>{parts[0]}<span className="text-red-600 font-black uppercase tracking-wide">HIGH Priority</span>{parts[1]}</>;
                    }
                    if (text.includes('MEDIUM Priority')) {
                      const parts = text.split('MEDIUM Priority');
                      return <>{parts[0]}<span className="text-orange-500 font-black uppercase tracking-wide">MEDIUM Priority</span>{parts[1]}</>;
                    }
                    if (text.includes('LOW Priority')) {
                      const parts = text.split('LOW Priority');
                      return <>{parts[0]}<span className="text-emerald-500 font-black uppercase tracking-wide">LOW Priority</span>{parts[1]}</>;
                    }
                    return <>{text}</>;
                  };

                  return (
                    <div key={act.id} className="relative pl-6 pb-10">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 ${getActivityColor(act.action_text)} rounded-full border-[3px] border-white shadow-sm`}></div>
                      <p className="font-bold text-black text-sm">{renderActionText(act.action_text)}</p>
                      <p className="text-gray-500 text-[11px] mt-1">{new Date(act.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  );
                })}

                <div className="relative pl-6 flex flex-col">
                  <h2 className="font-black text-black uppercase text-sm tracking-wide mb-4 mt-2">Messages</h2>
                  <div className="flex flex-col gap-6 relative overflow-y-auto max-h-[400px] custom-scrollbar pr-4 py-2">
                    {comments.map(c => {
                      const isMe = c.user_id === currentUserProfile?.id;
                      let authorName = '';
                      if (isMe) {
                        authorName = 'YOU';
                      } else {
                        const role = c.users.role || '';
                        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
                          authorName = `${c.users.first_name} ${c.users.last_name} > MapuOne Admin`;
                        } else if (role === 'HANDLER') {
                          authorName = `${c.users.first_name} ${c.users.last_name} > ${c.users.department || 'Handler'}`;
                        } else {
                          authorName = `${c.users.first_name} ${c.users.last_name}`;
                        }
                      }
                      
                      return (
                        <div key={c.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${isMe ? 'bg-white' : 'bg-[#F8F6F9]'} rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]`}>
                            <div className={`flex justify-between items-center mb-2 gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <div className="flex items-center gap-2">
                                <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                                <span className="font-black text-black text-xs md:text-sm">{authorName.toUpperCase()}</span>
                              </div>
                              <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">
                                {new Date(c.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-gray-800 text-sm leading-relaxed ${isMe ? 'mr-7 md:mr-8 text-right' : 'ml-7 md:ml-8'}`}>{c.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 ml-4 md:ml-8">
                    <label className="block text-black text-xs font-bold mb-2">Reply to this case</label>
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Type a message..." 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary mb-4 shadow-sm"
                    />
                    <div className="flex justify-end">
                      <button onClick={handleSendComment} className="bg-[#E50000] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-lg text-sm uppercase tracking-wide shadow-sm">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-5 pt-1 lg:border-l lg:border-gray-200 lg:pl-8">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-black text-xs font-black uppercase tracking-wide">Priority</label>
                <div className="relative w-full z-40">
                  <button 
                    disabled={currentUserProfile?.role === 'HANDLER' || selectedCase.rawStatus === 'RESOLVED'}
                    onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')} 
                    className={`w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-800 text-left ${currentUserProfile?.role === 'HANDLER' || selectedCase.rawStatus === 'RESOLVED' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getPriorityStyle(priority)}`}>
                      {priority}
                    </span>
                    {(currentUserProfile?.role !== 'HANDLER' && selectedCase.rawStatus !== 'RESOLVED') && <span className="text-gray-400 text-[10px]">▶</span>}
                  </button>
                  {activeDropdown === 'priority' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col p-2 gap-1">
                      {['HIGH', 'MEDIUM', 'LOW'].map((opt) => (
                        <button key={opt} onClick={() => { setPriority(opt); setActiveDropdown(null); }} className="px-2 py-2 text-sm font-bold text-left hover:bg-gray-200 rounded-md flex items-center">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getPriorityStyle(opt)}`}>
                            {opt}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-black text-xs font-black uppercase tracking-wide">Assigned To</label>
                <div className="relative w-full z-20">
                  <button 
                    disabled={currentUserProfile?.role === 'HANDLER' || selectedCase.rawStatus === 'RESOLVED'}
                    onClick={() => setActiveDropdown(activeDropdown === 'assigned' ? null : 'assigned')} 
                    className={`w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-800 text-left ${currentUserProfile?.role === 'HANDLER' || selectedCase.rawStatus === 'RESOLVED' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {handlers.find(h => h.id === assigned) ? `${handlers.find(h => h.id === assigned).first_name} ${handlers.find(h => h.id === assigned).last_name}` : 'UNASSIGNED'}
                    {(currentUserProfile?.role !== 'HANDLER' && selectedCase.rawStatus !== 'RESOLVED') && <span className="text-gray-400 text-[10px]">▶</span>}
                  </button>
                  {activeDropdown === 'assigned' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col max-h-48 overflow-y-auto">
                      <button onClick={() => { setAssigned('UNASSIGNED'); setActiveDropdown(null); }} className="px-4 py-3 text-sm font-bold text-left hover:bg-gray-200">UNASSIGNED</button>
                      {handlers.filter(h => {
                        if (h.role === 'ADMIN') return true;
                        if (!h.handled_categories) return false;
                        const cats = h.handled_categories.split(',').map((c: string) => c.trim().toUpperCase());
                        const targetCategory = selectedCase?.rawCategory ? selectedCase.rawCategory.trim().toUpperCase() : '';
                        return cats.some((c: string) => c.replace('_', ' ') === targetCategory.replace('_', ' '));
                      }).map((h) => (
                        <button key={h.id} onClick={() => { setAssigned(h.id); setActiveDropdown(null); }} className="px-4 py-3 text-sm font-bold text-left hover:bg-gray-200">{h.first_name} {h.last_name} ({h.role})</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-black text-xs font-black uppercase tracking-wide">Status</label>
                <div className="relative w-full z-10">
                  <button 
                    disabled={selectedCase.rawStatus === 'RESOLVED'}
                    onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')} 
                    className={`w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-800 text-left ${selectedCase.rawStatus === 'RESOLVED' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusStyle(status)}`}>
                      {status.replace('_', ' ')}
                    </span>
                    {selectedCase.rawStatus !== 'RESOLVED' && <span className="text-gray-400 text-[10px]">▶</span>}
                  </button>
                  {activeDropdown === 'status' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col p-2 gap-1">
                      {['OPEN', 'IN_PROCESS', 'PENDING_RESPONSE', 'RESOLVED'].map((opt) => (
                        <button key={opt} onClick={() => { setStatus(opt); setActiveDropdown(null); }} className="px-2 py-2 text-sm font-bold text-left hover:bg-gray-200 rounded-md flex items-center">
                          <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusStyle(opt)}`}>
                            {opt.replace('_', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedCase.rawStatus === 'RESOLVED' ? (
                <button 
                  onClick={async () => {
                    const { error } = await supabase
                      .from('complaints')
                      .update({ status: 'OPEN' })
                      .eq('id', selectedCase.id);
                    if (!error) {
                      showToast("Case reopened successfully.");
                      setSelectedCase(null);
                      fetchData();
                    } else {
                      showToast("Failed to reopen case.");
                    }
                  }}
                  className="w-full mt-4 px-4 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg text-sm font-bold uppercase tracking-wide transition-colors"
                >
                  Reopen Case
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (status === 'RESOLVED' && selectedCase.rawStatus !== 'RESOLVED') {
                      setResolveModalOpen(true);
                    } else {
                      setConfirmSaveModalOpen(true);
                    }
                  }}
                  className="w-full mt-4 px-4 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg text-sm font-bold uppercase tracking-wide transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <PopupDialog isOpen={resolveModalOpen} hideHeader={true} maxWidth="max-w-md" onClose={() => setResolveModalOpen(false)} footer={
          <div className="w-full flex justify-end gap-3 px-4 pb-2">
            <button onClick={() => setResolveModalOpen(false)} className="px-5 py-2.5 bg-[#D4D4D4] hover:bg-gray-400 text-black rounded-lg font-bold text-sm transition-colors uppercase">Cancel</button>
            <button onClick={handleResolve} className="px-5 py-2.5 bg-[#10B981] hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors uppercase">Confirm Resolve</button>
          </div>
        }>
        <div className="flex flex-col px-4 pt-2">
          <h2 className="text-2xl font-black text-black text-center mb-6">Resolve Case</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-black text-xs uppercase">Internal Note</label>
              <textarea value={resolveComments.internal} onChange={(e) => setResolveComments({ ...resolveComments, internal: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-black min-h-[80px]" placeholder="Optional internal record..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-black text-xs uppercase">External Comment (Visible to User)</label>
              <textarea value={resolveComments.external} onChange={(e) => setResolveComments({ ...resolveComments, external: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm text-black min-h-[80px]" placeholder="Explain how it was resolved..." />
            </div>
          </div>
        </div>
      </PopupDialog>

      <PopupDialog isOpen={confirmSaveModalOpen} hideHeader={true} maxWidth="max-w-md" onClose={() => setConfirmSaveModalOpen(false)} footer={
          <div className="w-full flex justify-end gap-3 px-4 pb-2">
            <button onClick={() => setConfirmSaveModalOpen(false)} className="px-5 py-2.5 bg-[#D4D4D4] hover:bg-gray-400 text-black rounded-lg font-bold text-sm transition-colors uppercase">Cancel</button>
            <button onClick={async () => {
              const updates: any = { status };
              if (currentUserProfile?.role === 'ADMIN') {
                updates.priority = priority;
                updates.assigned_handler_id = assigned === 'UNASSIGNED' ? null : assigned;
              }
              const { error } = await supabase.from('complaints').update(updates).eq('id', selectedCase.id);
              if (error) alert("Error saving changes: " + error.message);
              fetchData();
              if (assigned !== currentUserProfile?.id && currentUserProfile?.role === 'ADMIN') {
                setSelectedCase(null);
              }
              setConfirmSaveModalOpen(false);
            }} className="px-5 py-2.5 bg-[#10B981] hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors uppercase">Confirm Save</button>
          </div>
        }>
        <div className="flex flex-col px-4 pt-2 pb-4">
          <h2 className="text-2xl font-black text-black text-center mb-4">Confirm Changes</h2>
          <p className="text-center text-gray-600 text-sm">Are you sure you want to save these updates to the case?</p>
        </div>
      </PopupDialog>
    </div>
  );
}

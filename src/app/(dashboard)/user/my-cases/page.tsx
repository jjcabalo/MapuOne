'use client';

import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Case {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  filed: string;
  updated: string;
  status: string;
  rawStatus: string;
  created_at: string;
  matched_keyword?: string;
  description?: string;
  attachments?: any[];
}

interface Comment {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  users: {
    first_name: string;
    last_name: string;
    role: string;
    department?: string;
  }
}

const filters = ['ALL', 'OPEN', 'IN PROCESS', 'PENDING RESPONSE', 'RESOLVED'];

export default function MyCasesPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchCases();

    const complaintsChannel = supabase.channel('user-complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(complaintsChannel);
    };
  }, []);

  useEffect(() => {
    if (!selectedCase) return;

    const caseChannel = supabase.channel(`case-${selectedCase.id}`)
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

  const fetchCases = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setCurrentUser(session.user);

    const { data } = await supabase
      .from('complaints')
      .select('*, complaint_attachments(*)')
      .eq('complainant_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map(d => ({
        id: d.id,
        ticket_number: `MU-${new Date(d.created_at).getFullYear()}-${String(d.ticket_number).padStart(3, '0')}`,
        subject: d.title || `Untitled Complaint`,
        description: d.description,
        category: d.category.replace('_', ' '),
        filed: new Date(d.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        updated: new Date(d.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: d.status.replace('_', ' '),
        rawStatus: d.status,
        matched_keyword: d.matched_keyword,
        created_at: d.created_at,
        attachments: d.complaint_attachments || []
      }));
      setCases(formatted);

      // Auto-select case if caseId is in the URL
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCaseId = urlParams.get('caseId');
        if (urlCaseId) {
          const targetCase = formatted.find(c => c.id === urlCaseId);
          if (targetCase && (!selectedCase || selectedCase.id !== targetCase.id)) {
            setSelectedCase(targetCase);
            fetchComments(targetCase.id);
            fetchActivities(targetCase.id);
          }
        }
      }

      // Live-update currently selected case details if already open
      setSelectedCase((prev: any) => {
        if (!prev) return prev;
        const updatedTarget = formatted.find((c: any) => c.id === prev.id);
        return updatedTarget ? updatedTarget : prev;
      });
    }
    setIsLoading(false);
  };

  const fetchComments = async (caseId: string) => {
    const { data } = await supabase
      .from('comments')
      .select('id, message, created_at, user_id, users(first_name, last_name, role, department)')
      .eq('complaint_id', caseId)
      .order('created_at', { ascending: true });
      
    if (data) {
      setComments(data as any);
    }
  };

  const fetchActivities = async (caseId: string) => {
    const { data } = await supabase.from('case_activities').select('*').eq('complaint_id', caseId).order('created_at', { ascending: true });
    if (data) setActivities(data);
  };

  const handleCaseSelect = (item: Case) => {
    setSelectedCase(item);
    fetchComments(item.id);
    fetchActivities(item.id);
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedCase || !currentUser) return;
    setIsSending(true);
    
    const { error } = await supabase
      .from('comments')
      .insert({
        complaint_id: selectedCase.id,
        user_id: currentUser.id,
        message: newComment
      });
      
    if (!error) {
      setNewComment('');
      fetchComments(selectedCase.id);
    } else {
      alert("Error sending message");
    }
    setIsSending(false);
  };

  const filteredCases = cases.filter((c) => {
    const matchesFilter = activeFilter === 'ALL' || c.status === activeFilter;
    const matchesSearch = c.subject.toLowerCase().includes(searchQuery.toLowerCase()) || c.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCases.length / rowsPerPage);
  const paginatedCases = filteredCases.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getCategoryStyle = (cat: string) => {
    if (!cat) return 'bg-gray-200 text-gray-800';
    const upper = cat.toUpperCase();
    if (upper.includes('FACILITIES')) return 'bg-[#FFBFC4] text-[#E50000]';
    if (upper.includes('ACADEMIC')) return 'bg-[#9B9BE3] text-white';
    if (upper.includes('IT')) return 'bg-[#5BC0DE] text-white';
    if (upper.includes('STUDENT')) return 'bg-[#95C287] text-white';
    return 'bg-gray-200 text-gray-800';
  };

  const renderCaseCard = (item: Case, isDetailView = false) => {
    let statusBg = 'bg-gray-200';
    if (item.status === 'OPEN') statusBg = 'bg-[#FFBFC4]';
    if (item.status === 'IN PROCESS') statusBg = 'bg-[#FDF2C8]';
    if (item.status === 'RESOLVED') statusBg = 'bg-[#D1F0D4]';

    return (
      <div 
        key={item.id} 
        onClick={() => !isDetailView && handleCaseSelect(item)}
        className={`bg-[#F8F6F9] border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDetailView ? 'shadow-md mb-8' : 'shadow-sm hover:shadow-md cursor-pointer transition-shadow'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
          <div className={`w-full md:w-32 flex-shrink-0 ${getCategoryStyle(item.category)} text-[10px] font-bold text-center uppercase py-2 px-2 rounded-md tracking-wider leading-tight h-min`}>
            {item.category.replace(' ', '\n')}
          </div>
          
          <div className="flex flex-col flex-1">
            <span className="text-gray-600 text-xs font-bold mb-1">{item.ticket_number}</span>
            <h3 className="text-black text-sm md:text-base font-black uppercase mb-1">{item.subject}</h3>
            <span className="text-gray-500 text-xs font-medium">
              Filed {item.filed} | Updated {item.updated}
            </span>
          </div>
        </div>
        <div className={`px-4 py-1.5 ${statusBg} text-black rounded-md text-xs font-bold uppercase tracking-wide text-center whitespace-nowrap self-start md:self-center mt-2 md:mt-0`}>
          {item.status}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-poppins">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide">
          My Cases
        </h1>
        
        {!selectedCase ? (
          <>
            <p className="text-black text-sm md:text-base mb-6 mt-2">
              Track every complaint you've filed in real time, from submission through resolution.
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
              <input
                type="text"
                placeholder="Search your cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black placeholder-gray-400"
              />
            </div>
          </>
        ) : (
          <button 
            onClick={() => {
              setSelectedCase(null);
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('caseId');
                window.history.pushState({}, '', url);
              }
            }}
            className="text-gray-600 hover:text-black text-sm mt-1 mb-2 flex items-center gap-1 transition-colors"
          >
            ← Back to My Cases
          </button>
        )}
      </div>

      <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar pb-10">
        {!selectedCase && (
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="text-center py-20 text-gray-500 font-medium uppercase tracking-widest">Loading Cases...</div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-20 text-gray-500 font-medium">No cases found matching your criteria.</div>
            ) : (
              paginatedCases.map((item) => renderCaseCard(item))
            )}
            
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500 font-medium">
                  Showing <span className="text-black font-bold">{((currentPage - 1) * rowsPerPage) + 1}</span> to <span className="text-black font-bold">{Math.min(currentPage * rowsPerPage, filteredCases.length)}</span> of <span className="text-black font-bold">{filteredCases.length}</span> cases
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wide shadow-sm"
                  >
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          currentPage === i + 1 
                            ? 'bg-[#E50000] text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wide shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedCase && (
          <div className="flex flex-col w-full">
            {renderCaseCard(selectedCase, true)}
            
            <div className="mt-2 flex flex-col pl-2 md:pl-4">
              <h2 className="font-black text-black uppercase text-sm tracking-wide mb-6">Case Activity</h2>
              
              <div className="relative border-l-2 border-gray-300 ml-3 md:ml-4 flex flex-col pb-4">
                
                <div className="relative pl-6 pb-6">
                  <div className={`absolute -left-[11px] top-1 w-5 h-5 ${getCategoryStyle(selectedCase.category).split(' ')[0]} rounded-full border-[3px] border-white shadow-sm`}></div>
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

                {activities.filter((a) => !a.action_text.startsWith('CASE OPENED')).map((act) => {
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
                    {comments.map((comment) => {
                      const isMe = currentUser?.id === comment.user_id;
                      let authorName = '';
                      if (isMe) {
                        authorName = 'YOU';
                      } else {
                        const role = comment.users.role || '';
                        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
                          authorName = `${comment.users.first_name} ${comment.users.last_name} > MapuOne Admin`;
                        } else if (role === 'HANDLER') {
                          authorName = `${comment.users.first_name} ${comment.users.last_name} > ${comment.users.department || 'Handler'}`;
                        } else {
                          authorName = `${comment.users.first_name} ${comment.users.last_name}`;
                        }
                      }

                      return (
                        <div key={comment.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${isMe ? 'bg-white' : 'bg-[#F8F6F9]'} rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]`}>
                            <div className={`flex justify-between items-center mb-2 gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <div className="flex items-center gap-2">
                                <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                                <span className="font-black text-black text-xs md:text-sm">{authorName.toUpperCase()}</span>
                              </div>
                              <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">
                                {new Date(comment.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-gray-800 text-sm leading-relaxed ${isMe ? 'mr-7 md:mr-8 text-right' : 'ml-7 md:ml-8'}`}>
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {comments.length === 0 && (
                      <div className="text-gray-400 text-xs text-center py-4">No messages yet.</div>
                    )}
                  </div>
                  
                  <div className="mt-8 ml-4 md:ml-8">
                    <label className="block text-black text-xs font-bold mb-2">Reply to this case</label>
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Type a message..." 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent mb-4"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleSendComment}
                        disabled={isSending || !newComment.trim()}
                        className="bg-[#E50000] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-colors uppercase tracking-wide"
                      >
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';

const mockCases = [
  { id: 'MU-2026-000', subject: 'AIRCON NOT WORKING IN ROOM 000', category: 'FACILITIES', filed: 'Aug 3, 2026', updated: 'Aug 10, 2026', status: 'IN PROGRESS' },
  { id: 'MU-2026-111', subject: 'GRADE DISCREPANCY IN IT ELECTIVES', category: 'ACADEMIC AFFAIRS', filed: 'Jul 30, 2026', updated: 'Aug 9, 2026', status: 'OPEN' },
  { id: 'MU-02026-222', subject: 'CANNOT LOGIN TO STUDENT PORTAL', category: 'IT TECHNICAL SUPPORT', filed: 'Jul 22, 2026', updated: 'Jul 25, 2026', status: 'RESOLVED' },
  { id: 'MU-2026-333', subject: 'SCHOLARSHIP CLEARANCE NOT PROCESSED', category: 'STUDENT SERVICES', filed: 'Jul 18, 2026', updated: 'Jul 18, 2026', status: 'IN PROGRESS' },
  { id: 'MU-2026-444', subject: 'BROKEN CHAIR, ROOM 111', category: 'FACILITIES', filed: 'Jul 5, 2026', updated: 'Jul 9, 2026', status: 'OPEN' },
  { id: 'MU-2026-555', subject: 'REQUEST FOR MAKE-UP EXAM SCHEDULE', category: 'ACADEMIC AFFAIRS', filed: 'Jun 28, 2026', updated: 'Jul 2, 2026', status: 'RESOLVED' },
  { id: 'MU-2026-666', subject: 'WIFI DEADZONE IN LIBRARY 3RD FLOOR', category: 'IT TECHNICAL SUPPORT', filed: 'Jun 15, 2026', updated: 'Jun 15, 2026', status: 'PENDING RESPONSE' },
  { id: 'MU-2026-777', subject: 'MISSING ID REPLACEMENT INQUIRY', category: 'STUDENT SERVICES', filed: 'Jun 10, 2026', updated: 'Jun 14, 2026', status: 'IN PROGRESS' },
  { id: 'MU-2026-888', subject: 'LEAKING CEILING IN CAFETERIA', category: 'FACILITIES', filed: 'May 22, 2026', updated: 'May 23, 2026', status: 'OPEN' },
  { id: 'MU-2026-999', subject: 'UNABLE TO ACCESS BLACKBOARD MODULES', category: 'IT TECHNICAL SUPPORT', filed: 'May 10, 2026', updated: 'May 11, 2026', status: 'RESOLVED' },
  { id: 'MU-2026-101', subject: 'DROPPING OF COURSE LATE REQUEST', category: 'ACADEMIC AFFAIRS', filed: 'May 2, 2026', updated: 'May 5, 2026', status: 'PENDING RESPONSE' },
  { id: 'MU-2026-102', subject: 'REQUEST TO TRANSFER SECTION', category: 'ACADEMIC AFFAIRS', filed: 'Apr 10, 2026', updated: 'Apr 15, 2026', status: 'RESOLVED' },
];

const filters = ['ALL', 'OPEN', 'IN PROGRESS', 'PENDING RESPONSE', 'RESOLVED'];

export default function MyCasesPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<typeof mockCases[0] | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  // Filter logic
  const filteredCases = mockCases.filter((c) => {
    const matchesFilter = activeFilter === 'ALL' || c.status === activeFilter;
    const matchesSearch = c.subject.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCases.length / rowsPerPage);
  const paginatedCases = filteredCases.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reusable Card Renderer
  const renderCaseCard = (item: typeof mockCases[0], isDetailView = false) => {
    let catBg = 'bg-gray-300';
    if (item.category === 'FACILITIES') catBg = 'bg-[#FFBFC4]'; // Soft pink from mockup
    if (item.category === 'ACADEMIC AFFAIRS') catBg = 'bg-[#9B9BE3]'; // Soft purple from mockup
    if (item.category === 'IT TECHNICAL SUPPORT') catBg = 'bg-[#5BC0DE]'; // Teal from mockup
    if (item.category === 'STUDENT SERVICES') catBg = 'bg-[#95C287]'; // Green from mockup

    let statusBg = 'bg-gray-200';
    if (item.status === 'OPEN') statusBg = 'bg-[#FFBFC4]';
    if (item.status === 'IN PROGRESS') statusBg = 'bg-[#FDF2C8]';
    if (item.status === 'RESOLVED') statusBg = 'bg-[#D1F0D4]';

    return (
      <div 
        key={item.id} 
        onClick={() => !isDetailView && setSelectedCase(item)}
        className={`bg-[#F8F6F9] border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDetailView ? 'shadow-md mb-8' : 'shadow-sm hover:shadow-md cursor-pointer transition-shadow'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
          {/* Category Badge */}
          <div className={`w-full md:w-32 flex-shrink-0 ${catBg} text-white text-[10px] font-bold text-center uppercase py-2 px-2 rounded-md tracking-wider leading-tight h-min`}>
            {item.category.replace(' ', '\n')}
          </div>
          
          {/* Case Info */}
          <div className="flex flex-col flex-1">
            <span className="text-gray-600 text-xs font-bold mb-1">{item.id}</span>
            <h3 className="text-black text-sm md:text-base font-black uppercase mb-1">{item.subject}</h3>
            <span className="text-gray-500 text-xs font-medium">
              Filed {item.filed} | Updated {item.updated}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-1.5 ${statusBg} text-black rounded-md text-xs font-bold uppercase tracking-wide text-center whitespace-nowrap self-start md:self-center mt-2 md:mt-0`}>
          {item.status}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-poppins">
      
      {/* Title Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide">
          My Cases
        </h1>
        
        {/* Subheader: Varies based on view */}
        {!selectedCase ? (
          <>
            <p className="text-black text-sm md:text-base mb-6 mt-2">
              Track every complaint you've filed in real time, from submission through resolution.
            </p>
            {/* Filters and Search */}
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
            onClick={() => setSelectedCase(null)}
            className="text-gray-600 hover:text-black text-sm mt-1 mb-2 flex items-center gap-1 transition-colors"
          >
            ← Back to My Cases
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar pb-10">
        
        {/* LIST VIEW */}
        {!selectedCase && (
          <div className="flex flex-col gap-4">
            {paginatedCases.map((item) => renderCaseCard(item))}
            {filteredCases.length === 0 && (
              <div className="text-center py-20 text-gray-500 font-medium">
                No cases found matching your criteria.
              </div>
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

        {/* DETAIL VIEW */}
        {selectedCase && (
          <div className="flex flex-col w-full">
            {/* Context Card */}
            {renderCaseCard(selectedCase, true)}
            
            {/* Timeline Section */}
            <div className="mt-2 flex flex-col pl-2 md:pl-4">
              <h2 className="font-black text-black uppercase text-sm tracking-wide mb-6">Case Activity</h2>
              
              <div className="relative border-l-2 border-gray-300 ml-3 md:ml-4 flex flex-col pb-4">
                
                {/* Node 1: Open */}
                <div className="relative pl-6 pb-10">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#FFBFC4] rounded-full border-[3px] border-white shadow-sm"></div>
                  <p className="font-bold text-black text-sm">CASE OPENED - Route to {selectedCase.category} ("Keyword match: Aircon")</p>
                  <p className="text-gray-500 text-[11px] mt-1">Aug 3, 2026, 9:13 AM</p>
                </div>

                {/* Node 2: Progress */}
                <div className="relative pl-6 pb-6">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#FDF2C8] rounded-full border-[3px] border-white shadow-sm"></div>
                  <p className="font-bold text-black text-sm">Status Changed to In Progress and Marked as <span className="text-[#E50000]">HIGH Priority</span> - Assigned to A. Francisco, Facilities</p>
                  <p className="text-gray-500 text-[11px] mt-1">Aug 4, 2026, 10:00 AM</p>
                </div>

                {/* Messages Block */}
                <div className="relative pl-6 flex flex-col">
                  <h2 className="font-black text-black uppercase text-sm tracking-wide mb-4 mt-2">Messages</h2>
                  
                  {/* Independently Scrollable Messages Container */}
                  <div className="flex flex-col gap-6 relative overflow-y-auto max-h-[400px] custom-scrollbar pr-4 py-2">
                    
                    {/* Message 1 (Admin - Left) */}
                    <div className="flex w-full justify-start">
                      <div className="bg-[#F8F6F9] rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            <span className="font-black text-black text-xs md:text-sm">A Francisco <span className="font-normal mx-1">{'>'}</span> {selectedCase.category}</span>
                          </div>
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 10, 9:34 AM</span>
                        </div>
                        <p className="text-gray-800 text-sm ml-7 md:ml-8 leading-relaxed">We've inspected the unit — replacement part is on order, expected by Friday.</p>
                      </div>
                    </div>

                    {/* Message 2 (User - Right) */}
                    <div className="flex w-full justify-end">
                      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 10, 5:30 PM</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-xs md:text-sm">USER 000</span>
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                          </div>
                        </div>
                        <p className="text-gray-800 text-sm mr-7 md:mr-8 text-right leading-relaxed">Thank you, appreciate the update!</p>
                      </div>
                    </div>

                    {/* Message 3 (User - Right) */}
                    <div className="flex w-full justify-end">
                      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 12, 8:00 AM</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-xs md:text-sm">USER 000</span>
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                          </div>
                        </div>
                        <p className="text-gray-800 text-sm mr-7 md:mr-8 text-right leading-relaxed">Hello, just following up to see if the replacement part arrived today as expected?</p>
                      </div>
                    </div>

                    {/* Message 4 (Admin - Left) */}
                    <div className="flex w-full justify-start">
                      <div className="bg-[#F8F6F9] rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            <span className="font-black text-black text-xs md:text-sm">A Francisco <span className="font-normal mx-1">{'>'}</span> {selectedCase.category}</span>
                          </div>
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 12, 10:15 AM</span>
                        </div>
                        <p className="text-gray-800 text-sm ml-7 md:ml-8 leading-relaxed">Yes, it just arrived! Our maintenance team will be installing it this afternoon around 2 PM.</p>
                      </div>
                    </div>

                    {/* Message 5 (User - Right) */}
                    <div className="flex w-full justify-end">
                      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 12, 2:45 PM</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-xs md:text-sm">USER 000</span>
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                          </div>
                        </div>
                        <p className="text-gray-800 text-sm mr-7 md:mr-8 text-right leading-relaxed">Awesome! I can confirm the team is here working on it right now. Thanks for the swift action.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reply Box */}
                  <div className="mt-8 ml-4 md:ml-8">
                    <label className="block text-black text-xs font-bold mb-2">Reply to this case</label>
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent mb-4"
                    />
                    <div className="flex justify-end">
                      <button className="bg-[#E50000] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-colors uppercase tracking-wide">
                        Send
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

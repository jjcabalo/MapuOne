'use client';

import { useState } from 'react';
import { UserCircle } from 'lucide-react';

const mockCases = [
  { id: 1, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'OPEN' },
  { id: 2, complaint: 'Broken projector, room 412', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'IN PROGRESS' },
  { id: 3, complaint: 'Flickering lights, room 201', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'RESOLVED' },
  { id: 4, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'RESOLVED' },
  { id: 5, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'OPEN' },
  { id: 6, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'PENDING' },
  { id: 7, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'IN PROGRESS' },
  { id: 8, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'PENDING' },
  { id: 9, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'PENDING' },
  { id: 10, complaint: 'Aircon not working, room 305', filedBy: 'Z Pedregosa', date: 'Aug 17, 2026', assigned: 'L Penaflor', status: 'OPEN' },
];

export default function AdminCaseQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCase, setSelectedCase] = useState<typeof mockCases[0] | null>(null);
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [priority, setPriority] = useState('HIGH');
  const [category, setCategory] = useState('FACILITIES');
  const [assigned, setAssigned] = useState('A. FRANCISCO');
  const [status, setStatus] = useState('IN PROGRESS');

  const filteredCases = mockCases.filter(c => 
    c.complaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.filedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCount = filteredCases.filter(c => c.status === 'OPEN').length;
  const inProgressCount = filteredCases.filter(c => c.status === 'IN PROGRESS').length;
  const pendingCount = filteredCases.filter(c => c.status === 'PENDING').length;
  const resolvedCount = filteredCases.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col h-auto md:h-full font-poppins w-full min-h-full shrink-0">
      
      {/* Title & Search Row / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide">
            {selectedCase ? 'Case Details' : 'Case Queue'}
          </h1>
          {selectedCase && (
            <button 
              onClick={() => setSelectedCase(null)}
              className="text-gray-600 hover:text-black text-sm mt-2 flex items-center gap-1 transition-colors"
            >
              ← Back to Case Queue
            </button>
          )}
        </div>
        
        {!selectedCase && (
          <input
            type="text"
            placeholder="Search your cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black placeholder-gray-400 shadow-sm"
          />
        )}
      </div>

      {!selectedCase ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 flex-shrink-0">
            
            {/* Open Card */}
            <div className="bg-[#FFBFC4] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <span className="font-bold text-xl text-black uppercase z-10">Open</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">
                {openCount}
              </span>
            </div>

            {/* In Progress Card */}
            <div className="bg-[#FDF2C8] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <span className="font-bold text-xl text-black uppercase z-10 w-28 md:w-auto leading-tight md:leading-normal">In Progress</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">
                {inProgressCount}
              </span>
            </div>

            {/* Pending Card */}
            <div className="bg-[#EBDDD0] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <span className="font-bold text-xl text-black uppercase z-10">Pending</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">
                {pendingCount}
              </span>
            </div>

            {/* Resolved Card */}
            <div className="bg-[#D1F0D4] rounded-2xl p-6 h-40 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <span className="font-bold text-xl text-black uppercase z-10">Resolved</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-6 text-[9rem] font-bold text-black/10 leading-none select-none z-0 tracking-tighter">
                {resolvedCount}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto overflow-y-visible md:overflow-auto custom-scrollbar pb-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-white z-10 before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:border-b-2 before:border-black">
                <tr>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide w-[35%]">Complaint</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center">Filed By</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center">Date</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center">Assigned</th>
                  <th className="py-3 px-2 font-black text-black text-sm uppercase tracking-wide text-center w-[15%]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => {
                  let statusBg = 'bg-gray-200';
                  if (c.status === 'OPEN') statusBg = 'bg-[#FFBFC4]';
                  if (c.status === 'IN PROGRESS') statusBg = 'bg-[#FDF2C8]';
                  if (c.status === 'PENDING') statusBg = 'bg-[#EBDDD0]';
                  if (c.status === 'RESOLVED') statusBg = 'bg-[#D1F0D4]';

                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedCase(c)}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-2 text-sm text-gray-800">{c.complaint}</td>
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
            
            {filteredCases.length === 0 && (
              <div className="text-center py-20 text-gray-500 font-medium">
                No cases match your search.
              </div>
            )}
          </div>
        </>
      ) : (
        /* CASE DETAILS VIEW */
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          
          {/* Top Banner Card */}
          <div className="bg-[#F8F6F9] border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md mb-8 mt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
              <div className="w-full md:w-32 flex-shrink-0 bg-[#FFBFC4] text-white text-[10px] font-bold text-center uppercase py-2 px-2 rounded-md tracking-wider leading-tight h-min">
                FACILITIES
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-gray-600 text-xs font-bold mb-1">MU-2026-{String(selectedCase.id).padStart(3, '0')}</span>
                <h3 className="text-black text-sm md:text-base font-black uppercase mb-1">{selectedCase.complaint}</h3>
                <span className="text-gray-500 text-xs font-medium">
                  Filed {selectedCase.date} | Updated Aug 10, 2026
                </span>
              </div>
            </div>
            
            {/* Dynamic Status Badge matching table styling */}
            <div className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide text-center whitespace-nowrap self-start md:self-center mt-2 md:mt-0 ${
              selectedCase.status === 'OPEN' ? 'bg-[#FFBFC4] text-black' :
              selectedCase.status === 'IN PROGRESS' ? 'bg-[#FDF2C8] text-black' :
              selectedCase.status === 'PENDING' ? 'bg-[#EBDDD0] text-black' :
              'bg-[#D1F0D4] text-black'
            }`}>
              {selectedCase.status}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
            
            {/* Left Column: Timeline & Messages */}
            <div className="flex-1 flex flex-col pl-2 md:pl-4">
              <h2 className="font-black text-black uppercase text-sm tracking-wide mb-6">Case Activity</h2>
              
              <div className="relative border-l-2 border-gray-300 ml-3 md:ml-4 flex flex-col pb-4">
                
                {/* Node 1: Open */}
                <div className="relative pl-6 pb-10">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#FFBFC4] rounded-full border-[3px] border-white shadow-sm"></div>
                  <p className="font-bold text-black text-sm">CASE OPENED - Route to Facilities Management ("Keyword match: Aircon")</p>
                  <p className="text-gray-500 text-[11px] mt-1">Aug 3, 2026, 9:13 AM</p>
                </div>

                {/* Node 2: Progress */}
                <div className="relative pl-6 pb-6">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#FDF2C8] rounded-full border-[3px] border-white shadow-sm"></div>
                  <p className="font-bold text-black text-sm">Status Changed to In Progress - Assigned to A. Francisco, Facilities</p>
                  <p className="text-gray-500 text-[11px] mt-1">Aug 4, 2026, 10:00 AM</p>
                </div>

                {/* Messages Block */}
                <div className="relative pl-6 flex flex-col">
                  <h2 className="font-black text-black uppercase text-sm tracking-wide mb-4 mt-2">Messages</h2>
                  
                  {/* Independently Scrollable Messages Container */}
                  <div className="flex flex-col gap-6 relative overflow-y-auto max-h-[400px] custom-scrollbar pr-4 py-2">
                    
                    {/* Message 1 (Admin - Right) */}
                    <div className="flex w-full justify-end">
                      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 10, 9:34 AM</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-xs md:text-sm">A Francisco <span className="font-normal mx-1">{'>'}</span> Facilities</span>
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                          </div>
                        </div>
                        <p className="text-gray-800 text-sm mr-7 md:mr-8 text-right leading-relaxed">We've inspected the unit — replacement part is on order, expected by Friday.</p>
                      </div>
                    </div>

                    {/* Message 2 (User - Left) */}
                    <div className="flex w-full justify-start">
                      <div className="bg-[#F8F6F9] rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            <span className="font-black text-black text-xs md:text-sm">USER 000</span>
                          </div>
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 10, 5:30 PM</span>
                        </div>
                        <p className="text-gray-800 text-sm ml-7 md:ml-8 leading-relaxed">Thank you, appreciate the update!</p>
                      </div>
                    </div>

                    {/* Message 3 (User - Left) */}
                    <div className="flex w-full justify-start">
                      <div className="bg-[#F8F6F9] rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            <span className="font-black text-black text-xs md:text-sm">USER 000</span>
                          </div>
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 12, 8:00 AM</span>
                        </div>
                        <p className="text-gray-800 text-sm ml-7 md:ml-8 leading-relaxed">Hello, just following up to see if the replacement part arrived today as expected?</p>
                      </div>
                    </div>

                    {/* Message 4 (Admin - Right) */}
                    <div className="flex w-full justify-end">
                      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 12, 10:15 AM</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-xs md:text-sm">A Francisco <span className="font-normal mx-1">{'>'}</span> Facilities</span>
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                          </div>
                        </div>
                        <p className="text-gray-800 text-sm mr-7 md:mr-8 text-right leading-relaxed">Yes, it just arrived! Our maintenance team will be installing it this afternoon around 2 PM.</p>
                      </div>
                    </div>

                    {/* Message 5 (User - Left) */}
                    <div className="flex w-full justify-start">
                      <div className="bg-[#F8F6F9] rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]">
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            <span className="font-black text-black text-xs md:text-sm">USER 000</span>
                          </div>
                          <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">Aug 12, 2:45 PM</span>
                        </div>
                        <p className="text-gray-800 text-sm ml-7 md:ml-8 leading-relaxed">Awesome! I can confirm the team is here working on it right now. Thanks for the swift action.</p>
                      </div>
                    </div>

                  </div>
                  
                  {/* Reply Box */}
                  <div className="mt-8 ml-4 md:ml-8">
                    <label className="block text-black text-xs font-bold mb-2">Reply to this case</label>
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent mb-4 shadow-sm"
                    />
                    <div className="flex justify-end">
                      <button className="bg-[#E50000] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-colors uppercase tracking-wide shadow-sm">
                        Send
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Admin Controls */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-5 pt-1 lg:border-l lg:border-gray-200 lg:pl-8">
              
              {/* Custom Dropdown: Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-black text-xs font-black uppercase tracking-wide">Priority</label>
                <div className="relative w-full z-40">
                  <button 
                    type="button" 
                    onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left"
                  >
                    {priority}
                    <span className={`text-gray-400 text-[10px] transform transition-transform ${activeDropdown === 'priority' ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {activeDropdown === 'priority' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50">
                      {['HIGH', 'MEDIUM', 'LOW'].map((opt, i, arr) => (
                        <button 
                          key={opt} type="button" 
                          onClick={() => { setPriority(opt); setActiveDropdown(null); }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                          {opt}
                          {priority === opt && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Dropdown: Category */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-black text-xs font-black uppercase tracking-wide">Category</label>
                <div className="relative w-full z-30">
                  <button 
                    type="button" 
                    onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left"
                  >
                    {category}
                    <span className={`text-gray-400 text-[10px] transform transition-transform ${activeDropdown === 'category' ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {activeDropdown === 'category' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50">
                      {['FACILITIES', 'ACADEMIC AFFAIRS', 'IT SUPPORT'].map((opt, i, arr) => (
                        <button 
                          key={opt} type="button" 
                          onClick={() => { setCategory(opt); setActiveDropdown(null); }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                          {opt}
                          {category === opt && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Dropdown: Assigned To */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-black text-xs font-black uppercase tracking-wide">Assigned To</label>
                <div className="relative w-full z-20">
                  <button 
                    type="button" 
                    onClick={() => setActiveDropdown(activeDropdown === 'assigned' ? null : 'assigned')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left"
                  >
                    {assigned}
                    <span className={`text-gray-400 text-[10px] transform transition-transform ${activeDropdown === 'assigned' ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {activeDropdown === 'assigned' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50">
                      {['A. FRANCISCO', 'L. PENAFLOR', 'UNASSIGNED'].map((opt, i, arr) => (
                        <button 
                          key={opt} type="button" 
                          onClick={() => { setAssigned(opt); setActiveDropdown(null); }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                          {opt}
                          {assigned === opt && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Dropdown: Status */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-black text-xs font-black uppercase tracking-wide">Status</label>
                <div className="relative w-full z-10">
                  <button 
                    type="button" 
                    onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left"
                  >
                    {status}
                    <span className={`text-gray-400 text-[10px] transform transition-transform ${activeDropdown === 'status' ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {activeDropdown === 'status' && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50">
                      {['IN PROGRESS', 'OPEN', 'PENDING', 'RESOLVED'].map((opt, i, arr) => (
                        <button 
                          key={opt} type="button" 
                          onClick={() => { setStatus(opt); setActiveDropdown(null); }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                          {opt}
                          {status === opt && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button className="w-full bg-[#10B981] hover:bg-green-600 text-white font-bold py-3 rounded-lg text-sm transition-colors uppercase tracking-wide shadow-sm border border-green-700">
                  Mark Resolved
                </button>
                <button className="w-full bg-[#FFBFC4] hover:bg-pink-300 text-white font-bold py-3 rounded-lg text-sm transition-colors uppercase tracking-wide shadow-sm border border-pink-400">
                  Request Approval
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

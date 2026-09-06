'use client';

import { useState } from 'react';

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Hardcoded chart heights (percentages) for the CSS bars
  const deptData = [
    { label: 'Facilities', height: '60%', color: '#FFBFC4' }, // Pink
    { label: 'Academic\nAffairs', height: '85%', color: '#9B9BE3' }, // Purple
    { label: 'IT / Tech\nSupport', height: '35%', color: '#5BC0DE' }, // Teal
    { label: 'Student\nServices', height: '65%', color: '#95C287' }, // Green
  ];

  const statusData = [
    { label: 'Open', height: '35%', color: '#FFBFC4' }, // Pink
    { label: 'In Progress', height: '55%', color: '#FDF2C8' }, // Yellow
    { label: 'Pending\nResponse', height: '80%', color: '#EBDDD0' }, // Tan
    { label: 'Resolved', height: '100%', color: '#D1F0D4' }, // Green
  ];

  return (
    <div className="flex flex-col h-full font-poppins w-full overflow-y-auto custom-scrollbar pb-10 pr-2">
      
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide mb-1">
            Reports and Analytics
          </h1>
          <p className="text-gray-600 text-sm">
            Complaint volume, resolution timelines, and departmental activity.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap gap-4 w-full lg:w-auto">
          {/* Time Range Dropdown */}
          <div className="relative w-full sm:w-48 flex-shrink-0">
            <button 
              onClick={() => setIsTimeOpen(!isTimeOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {timeRange}
              <span className={`text-gray-500 text-[10px] transform transition-transform ${isTimeOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isTimeOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                {['Last 7 days', 'Last 30 days', 'Last 3 months', 'This Year', 'Custom Range...'].map(range => (
                  <button
                    key={range}
                    onClick={() => { setTimeRange(range); setIsTimeOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conditional Date Pickers for Custom Range */}
          {timeRange === 'Custom Range...' && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto transition-opacity duration-300 flex-shrink-0">
              <input 
                type="date" 
                className="w-full sm:w-36 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              <span className="text-gray-400 font-bold text-xs">TO</span>
              <input 
                type="date" 
                className="w-full sm:w-36 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
          )}

          {/* Export Dropdown */}
          <div className="relative w-full sm:w-48 flex-shrink-0">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-black uppercase tracking-wide hover:bg-gray-50 transition-colors shadow-sm"
            >
              Export Report
            </button>
            {isExportOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 flex flex-col">
                <button
                  onClick={() => setIsExportOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 border-b border-gray-100 flex items-center justify-between"
                >
                  Export as CSV <span className="text-[10px] text-gray-400">.csv</span>
                </button>
                <button
                  onClick={() => setIsExportOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                >
                  Export as PDF <span className="text-[10px] text-gray-400">.pdf</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 flex-shrink-0">
        
        {/* Total Filed */}
        <div className="bg-[#FFBFC4] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
          <span className="font-bold text-[#D00000] text-xs uppercase tracking-wide">Total Filed</span>
          <span className="text-4xl md:text-5xl font-black text-[#D00000] leading-none">128</span>
        </div>

        {/* Resolved */}
        <div className="bg-[#D1F0D4] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
          <span className="font-bold text-[#10B981] text-xs uppercase tracking-wide">Resolved</span>
          <span className="text-4xl md:text-5xl font-black text-[#10B981] leading-none">200</span>
        </div>

        {/* Avg Resolution */}
        <div className="bg-[#FDF2C8] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
          <span className="font-bold text-[#B48509] text-xs uppercase tracking-wide">Avg. Resolution</span>
          <span className="text-4xl md:text-5xl font-black text-[#B48509] leading-none">2.4d</span>
        </div>

        {/* Overdue */}
        <div className="bg-[#EBDDD0] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
          <span className="font-bold text-[#8C6B4A] text-xs uppercase tracking-wide">Overdue (High)</span>
          <span className="text-4xl md:text-5xl font-black text-[#8C6B4A] leading-none">3</span>
        </div>
        
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
        
        {/* Chart 1: Department */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-lg font-black text-black mb-10">Complaints by department</h2>
          
          <div className="flex-1 flex items-end justify-around gap-2 px-2 relative pt-10">
            {deptData.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full max-w-[80px] gap-4">
                {/* Bar */}
                <div 
                  className="w-full rounded-t-sm shadow-sm transition-all duration-1000 ease-out"
                  style={{ height: item.height, backgroundColor: item.color }}
                ></div>
                {/* Label */}
                <span className="text-center text-xs font-medium text-black whitespace-pre-line h-8 flex items-start justify-center leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Status */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-lg font-black text-black mb-10">Case status breakdown</h2>
          
          <div className="flex-1 flex items-end justify-around gap-2 px-2 relative pt-10">
            {statusData.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full max-w-[80px] gap-4">
                {/* Bar */}
                <div 
                  className="w-full rounded-t-sm shadow-sm transition-all duration-1000 ease-out"
                  style={{ height: item.height, backgroundColor: item.color }}
                ></div>
                {/* Label */}
                <span className="text-center text-xs font-medium text-black whitespace-pre-line h-8 flex items-start justify-center leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

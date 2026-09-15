'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [stats, setStats] = useState({
    totalFiled: 0,
    resolved: 0,
    avgResolution: '0d',
    overdue: 0
  });

  const [deptData, setDeptData] = useState([
    { label: 'Facilities', height: '0%', color: '#FFBFC4', count: 0 },
    { label: 'Academic\nAffairs', height: '0%', color: '#9B9BE3', count: 0 },
    { label: 'IT / Tech\nSupport', height: '0%', color: '#5BC0DE', count: 0 },
    { label: 'Student\nServices', height: '0%', color: '#95C287', count: 0 },
  ]);

  const [statusData, setStatusData] = useState([
    { label: 'Open', height: '0%', color: '#FFBFC4', count: 0 },
    { label: 'In Progress', height: '0%', color: '#FDF2C8', count: 0 },
    { label: 'Pending\nResponse', height: '0%', color: '#EBDDD0', count: 0 },
    { label: 'Resolved', height: '0%', color: '#D1F0D4', count: 0 },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  const [rawData, setRawData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    
    // In a real app we would apply a date filter based on timeRange
    // For now we will fetch all for the demo
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();

    let query = supabase
      .from('complaints')
      .select('*, complainant:users!complainant_id(first_name, last_name, email), handler:users!assigned_handler_id(first_name, last_name)');
      
    if (profile?.role === 'HANDLER' && profile.handled_categories) {
      const categories = profile.handled_categories.split(',').map((c: string) => c.trim());
      query = query.in('category', categories);
    }
    
    const { data } = await query;
    
    if (data) {
      // Sort by newest first
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRawData(data);
      const total = data.length;
      const resolved = data.filter(c => c.status === 'RESOLVED');
      
      // Calculate avg resolution time in days
      let avgRes = 0;
      if (resolved.length > 0) {
        const totalTime = resolved.reduce((acc, curr) => {
          if (curr.resolved_at && curr.created_at) {
            const diff = new Date(curr.resolved_at).getTime() - new Date(curr.created_at).getTime();
            return acc + (diff / (1000 * 60 * 60 * 24));
          }
          return acc;
        }, 0);
        avgRes = totalTime / resolved.length;
      }

      // Calculate Overdue (e.g. HIGH priority and older than 3 days, not resolved)
      const overdue = data.filter(c => {
        if (c.status === 'RESOLVED') return false;
        if (c.priority !== 'HIGH') return false;
        const diff = new Date().getTime() - new Date(c.created_at).getTime();
        return (diff / (1000 * 60 * 60 * 24)) > 3;
      }).length;

      setStats({
        totalFiled: total,
        resolved: resolved.length,
        avgResolution: `${avgRes.toFixed(1)}d`,
        overdue
      });

      // Calculate Department Chart
      const catCount = {
        'FACILITIES': data.filter(c => c.category === 'FACILITIES').length,
        'ACADEMIC_AFFAIRS': data.filter(c => c.category === 'ACADEMIC_AFFAIRS').length,
        'IT_SUPPORT': data.filter(c => c.category === 'IT_SUPPORT').length,
        'STUDENT_SERVICES': data.filter(c => c.category === 'STUDENT_SERVICES').length,
      };
      
      const maxCat = Math.max(...Object.values(catCount), 1);
      
      setDeptData([
        { label: 'Facilities', height: `${(catCount['FACILITIES'] / maxCat) * 100}%`, color: '#FFBFC4', count: catCount['FACILITIES'] },
        { label: 'Academic\nAffairs', height: `${(catCount['ACADEMIC_AFFAIRS'] / maxCat) * 100}%`, color: '#9B9BE3', count: catCount['ACADEMIC_AFFAIRS'] },
        { label: 'IT / Tech\nSupport', height: `${(catCount['IT_SUPPORT'] / maxCat) * 100}%`, color: '#5BC0DE', count: catCount['IT_SUPPORT'] },
        { label: 'Student\nServices', height: `${(catCount['STUDENT_SERVICES'] / maxCat) * 100}%`, color: '#95C287', count: catCount['STUDENT_SERVICES'] },
      ]);

      // Calculate Status Chart
      const statusCount = {
        'OPEN': data.filter(c => c.status === 'OPEN').length,
        'IN_PROCESS': data.filter(c => c.status === 'IN_PROCESS').length,
        'PENDING_RESPONSE': data.filter(c => c.status === 'PENDING_RESPONSE').length,
        'RESOLVED': data.filter(c => c.status === 'RESOLVED').length,
      };
      
      const maxStatus = Math.max(...Object.values(statusCount), 1);
      
      setStatusData([
        { label: 'Open', height: `${(statusCount['OPEN'] / maxStatus) * 100}%`, color: '#FFBFC4', count: statusCount['OPEN'] },
        { label: 'In Progress', height: `${(statusCount['IN_PROCESS'] / maxStatus) * 100}%`, color: '#FDF2C8', count: statusCount['IN_PROCESS'] },
        { label: 'Pending\nResponse', height: `${(statusCount['PENDING_RESPONSE'] / maxStatus) * 100}%`, color: '#EBDDD0', count: statusCount['PENDING_RESPONSE'] },
        { label: 'Resolved', height: `${(statusCount['RESOLVED'] / maxStatus) * 100}%`, color: '#D1F0D4', count: statusCount['RESOLVED'] },
      ]);
    }
    
    setIsLoading(false);
  };

  const handleExportCSV = () => {
    if (!rawData || rawData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      'Ticket Number', 
      'Title', 
      'Description', 
      'Category', 
      'Priority', 
      'Status', 
      'Date Filed',
      'Complainant Name',
      'Complainant Email',
      'Assigned Handler',
      'Resolution Date'
    ];
    
    const rows = rawData.map(c => {
      const ticketNum = c.ticket_number ? `MU-${new Date(c.created_at).getFullYear()}-${String(c.ticket_number).padStart(3, '0')}` : 'MU-0000-000';
      const title = `"${(c.title || '').replace(/"/g, '""')}"`;
      const description = `"${(c.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const compName = c.complainant ? `"${c.complainant.first_name} ${c.complainant.last_name}"` : 'Unknown';
      const compEmail = c.complainant ? `"${c.complainant.email}"` : 'Unknown';
      const handlerName = c.handler ? `"${c.handler.first_name} ${c.handler.last_name}"` : 'Unassigned';
      const resolutionDate = c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : '';

      return [
        ticketNum, 
        title, 
        description, 
        c.category, 
        c.priority, 
        c.status, 
        new Date(c.created_at).toLocaleDateString(),
        compName,
        compEmail,
        handlerName,
        resolutionDate
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MapuOne_Report_${timeRange.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  const handleExportPDF = async () => {
    setIsExportOpen(false);
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      setTimeout(() => {
        const element = document.getElementById('pdf-content');
        if (!element) return;
        
        const opt = {
          margin:       [10, 10, 10, 10], // top, left, bottom, right
          filename:     `MapuOne_Report_${timeRange.replace(/ /g, '_')}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak:    { mode: ['css', 'legacy'] }
        };
        
        const printTable = document.getElementById('pdf-table');
        if (printTable) {
          printTable.classList.remove('hidden');
          printTable.classList.remove('print:block');
          printTable.style.display = 'block';
        }
        
        html2pdf().set(opt).from(element).save().then(() => {
          if (printTable) {
            printTable.style.display = '';
            printTable.classList.add('hidden');
            printTable.classList.add('print:block');
          }
        });
      }, 100);
    } catch (e) {
      console.error("Error loading html2pdf", e);
      // Fallback to standard print if html2pdf isn't available
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-full font-poppins w-full overflow-y-auto print:overflow-visible custom-scrollbar pb-10 pr-2">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 flex-shrink-0 print-hide">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide mb-1">
            Reports and Analytics
          </h1>
          <p className="text-gray-600 text-sm">
            Complaint volume, resolution timelines, and departmental activity.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-48 flex-shrink-0">
            <button onClick={() => setIsTimeOpen(!isTimeOpen)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {timeRange}
              <span className={`text-gray-500 text-[10px] transform transition-transform ${isTimeOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isTimeOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                {['Last 7 days', 'Last 30 days', 'Last 3 months', 'This Year', 'All Time'].map(range => (
                  <button key={range} onClick={() => { setTimeRange(range); setIsTimeOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-48 flex-shrink-0">
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-black uppercase tracking-wide hover:bg-gray-50 transition-colors shadow-sm">
              Export Report
            </button>
            {isExportOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 flex flex-col">
                <button onClick={handleExportCSV} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 border-b border-gray-100 flex items-center justify-between">
                  Export as CSV <span className="text-[10px] text-gray-400">.csv</span>
                </button>
                <button onClick={handleExportPDF} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-between">
                  Export as PDF <span className="text-[10px] text-gray-400">.pdf</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="pdf-content" className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 flex-shrink-0">
          <div className="bg-[#FFBFC4] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
            <span className="font-bold text-[#D00000] text-xs uppercase tracking-wide">Total Filed</span>
            <span className="text-4xl md:text-5xl font-black text-[#D00000] leading-none">{stats.totalFiled}</span>
          </div>
          <div className="bg-[#D1F0D4] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
            <span className="font-bold text-[#10B981] text-xs uppercase tracking-wide">Resolved</span>
            <span className="text-4xl md:text-5xl font-black text-[#10B981] leading-none">{stats.resolved}</span>
          </div>
        <div className="bg-[#FDF2C8] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
          <span className="font-bold text-[#B48509] text-xs uppercase tracking-wide">Avg. Resolution</span>
          <span className="text-4xl md:text-5xl font-black text-[#B48509] leading-none">{stats.avgResolution}</span>
        </div>
        <div className="bg-[#EBDDD0] rounded-xl p-6 h-32 flex flex-col justify-between shadow-sm">
          <span className="font-bold text-[#8C6B4A] text-xs uppercase tracking-wide">Overdue (High)</span>
          <span className="text-4xl md:text-5xl font-black text-[#8C6B4A] leading-none">{stats.overdue}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-lg font-black text-black mb-10">Complaints by department</h2>
          <div className="flex-1 flex items-end justify-around gap-2 px-2 relative pt-10">
            {deptData.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full max-w-[80px] gap-4 group">
                <span className="text-xs font-bold text-gray-500 opacity-100 transition-opacity">{item.count}</span>
                <div className="w-full rounded-t-sm shadow-sm transition-all duration-1000 ease-out min-h-[4px]" style={{ height: item.height, backgroundColor: item.color }}></div>
                <span className="text-center text-[10px] font-medium text-black whitespace-pre-line h-8 flex items-start justify-center leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-lg font-black text-black mb-10">Case status breakdown</h2>
          <div className="flex-1 flex items-end justify-around gap-2 px-2 relative pt-10">
            {statusData.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full max-w-[80px] gap-4 group">
                <span className="text-xs font-bold text-gray-500 opacity-100 transition-opacity">{item.count}</span>
                <div className="w-full rounded-t-sm shadow-sm transition-all duration-1000 ease-out min-h-[4px]" style={{ height: item.height, backgroundColor: item.color }}></div>
                <span className="text-center text-[10px] font-medium text-black whitespace-pre-line h-8 flex items-start justify-center leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRINT-ONLY DATA TABLE */}
      <div id="pdf-table" className="hidden print:block mt-10 w-full break-before-page">
        <h2 className="text-xl font-black text-black mb-4 uppercase">Detailed Case Log</h2>
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 px-1 font-bold">Ticket</th>
              <th className="py-2 px-1 font-bold">Title</th>
              <th className="py-2 px-1 font-bold">Category</th>
              <th className="py-2 px-1 font-bold">Status</th>
              <th className="py-2 px-1 font-bold">Priority</th>
              <th className="py-2 px-1 font-bold">Filed</th>
              <th className="py-2 px-1 font-bold">Handler</th>
            </tr>
          </thead>
          <tbody>
            {rawData.map((c) => {
              const ticketNum = c.ticket_number ? `MU-${new Date(c.created_at).getFullYear()}-${String(c.ticket_number).padStart(3, '0')}` : 'MU-0000-000';
              const handlerName = c.handler ? `${c.handler.first_name[0]}. ${c.handler.last_name}` : 'Unassigned';
              return (
                <tr key={c.id} className="border-b border-gray-200">
                  <td className="py-2 px-1 font-medium">{ticketNum}</td>
                  <td className="py-2 px-1 truncate max-w-[150px]">{c.title || 'Untitled'}</td>
                  <td className="py-2 px-1">{c.category.replace('_', ' ')}</td>
                  <td className="py-2 px-1">{c.status.replace('_', ' ')}</td>
                  <td className="py-2 px-1">{c.priority}</td>
                  <td className="py-2 px-1">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-1">{handlerName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      </div>
    </div>
  );
}

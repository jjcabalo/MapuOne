'use client';

const mockComplaints = [
  { id: 1, category: 'Facilities', date: '10/12/26', status: 'OPEN' },
  { id: 2, category: 'Academic Affairs', date: '10/10/26', status: 'IN PROGRESS' },
  { id: 3, category: 'IT Support', date: '10/08/26', status: 'RESOLVED' },
  { id: 4, category: 'Student Services', date: '10/05/26', status: 'OPEN' },
  { id: 5, category: 'Facilities', date: '10/01/26', status: 'RESOLVED' },
  { id: 6, category: 'Academic Affairs', date: '09/28/26', status: 'IN PROGRESS' },
  { id: 7, category: 'IT Support', date: '09/25/26', status: 'OPEN' },
  { id: 8, category: 'Facilities', date: '09/20/26', status: 'RESOLVED' },
  { id: 9, category: 'Student Services', date: '09/15/26', status: 'RESOLVED' },
];

export default function UserDashboardPage() {
  
  const openCount = mockComplaints.filter(c => c.status === 'OPEN').length;
  const inProgressCount = mockComplaints.filter(c => c.status === 'IN PROGRESS').length;
  const resolvedCount = mockComplaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col h-full font-poppins">
      
      {/* Title & Stats (Fixed at top) */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-black text-black mb-8 uppercase tracking-wide">
          Welcome Back, User
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
          {mockComplaints.map((complaint) => {
            const bgStatusColor = 
              complaint.status === 'OPEN' ? 'bg-[#FFBFC4]' : 
              complaint.status === 'IN PROGRESS' ? 'bg-[#FDF2C8]' : 
              'bg-[#D1F0D4]';

            return (
              <div key={complaint.id} className="flex justify-between items-center py-6 border-b border-gray-200">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-2xl text-[#4A4A4A]">Complaint #{complaint.id}</h3>
                  <p className="text-xs text-gray-800 font-medium tracking-widest uppercase">
                    {complaint.category} | Filed Date: {complaint.date}
                  </p>
                </div>
                <div className={`px-8 py-2 rounded ${bgStatusColor} text-black font-bold text-xs uppercase text-center min-w-[140px]`}>
                  {complaint.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

export default function MyProfilePage() {
  return (
    <div className="flex flex-col h-full font-poppins w-full">
      
      {/* Title Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-black tracking-wide mb-2">
          My Profile
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          Manage your account information and login details.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar pb-10 flex flex-col gap-8">
        
        {/* Profile Information Card */}
        <div className="border border-gray-400 rounded-3xl p-6 md:p-10 bg-white">
          
          {/* Avatar and Info */}
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-[#D80000] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-3xl font-black tracking-wider">JD</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-black">Juan Dela Cruz</h2>
              <p className="text-gray-600 text-sm font-medium">Student - IT Department</p>
            </div>
          </div>

          {/* Form Fields */}
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Juan Dela Cruz"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Student ID</label>
                <input 
                  type="text" 
                  defaultValue="2026-0001"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="jdelacruz@mymail.mapua.edu.ph"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Course / Department</label>
                <input 
                  type="text" 
                  defaultValue="IT Department"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm"
                />
              </div>

            </div>

            {/* Save Button */}
            <div className="mt-4">
              <button 
                type="submit" 
                className="bg-[#222222] hover:bg-black text-white text-sm font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="border border-gray-400 rounded-3xl p-6 md:p-10 bg-white">
          <h2 className="text-xl font-black text-black mb-8">Change Password</h2>
          
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm"
                />
              </div>

            </div>

            {/* Save Button */}
            <div className="mt-4">
              <button 
                type="submit" 
                className="bg-[#222222] hover:bg-black text-white text-sm font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

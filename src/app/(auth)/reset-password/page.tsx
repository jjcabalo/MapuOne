'use client';

import { useState } from 'react';
import Link from 'next/link';
import PopupDialog from '@/components/shared/PopupDialog';

export default function ResetPasswordPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // In a real app, you would extract this email from the URL search params or a verification token
  const targetEmail = "johndoe@mymail.mapua.edu.ph";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPopupOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-poppins">
      {/* Header Image */}
      <div className="w-full h-48 md:h-[350px] relative overflow-hidden">
        <img 
          src="/assets/images/mapua-bg-header.png" 
          alt="Mapúa University" 
          className="w-full h-full object-cover object-top" 
        />
      </div>

      {/* Content Container - Equal top and left spacing with responsive padding */}
      <div className="flex-1 flex flex-col items-start px-6 sm:px-10 md:px-14 pt-6 sm:pt-8 md:pt-10 w-full text-left overflow-x-hidden">
        
        {/* Title - Scaled down to prevent scrolling, matching register page */}
        <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] xl:text-[5.5rem] font-black text-black tracking-[5%] mb-2 md:mb-4 leading-none">
          MapúOne
        </h1>
        
        {/* Subtitle / Description */}
        <p className="text-black font-bold max-w-4xl mb-2 text-xs sm:text-sm md:text-base leading-relaxed">
          Create a new password for your account.
        </p>
        
        {/* Target Email Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-6 md:mb-8 inline-block shadow-sm">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wide mr-2">Account:</span>
          <span className="text-black text-sm font-semibold">{targetEmail}</span>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-5 text-left pb-4">
          
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-black">New Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-black">Confirm New Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black"
            />
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-2">
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-primary hover:bg-red-700 border border-black text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm text-center uppercase whitespace-nowrap"
            >
              SAVE NEW PASSWORD
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      <PopupDialog
        isOpen={isPopupOpen}
        hideHeader={true}
        onClose={() => setIsPopupOpen(false)}
        maxWidth="max-w-md"
        footer={
          <div className="w-full flex justify-center px-4 pb-2">
            <Link 
              href="/login"
              className="px-10 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide w-full md:w-auto text-center block"
            >
              Okay
            </Link>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <div className="w-20 h-20 bg-[#D1F0D4] text-[#10B981] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-black mb-3 uppercase tracking-wide">Change Password Successful</h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
            Your MapúOne account password has been successfully changed. You can now log in using your new credentials.
          </p>
        </div>
      </PopupDialog>

    </div>
  );
}

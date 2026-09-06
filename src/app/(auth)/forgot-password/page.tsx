'use client';

import { useState } from 'react';
import Link from 'next/link';
import PopupDialog from '@/components/shared/PopupDialog';

export default function ForgotPasswordPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
        <p className="text-black font-bold max-w-4xl mb-6 md:mb-8 text-xs sm:text-sm md:text-base leading-relaxed">
          Enter your Mapúa email address below and we'll send you instructions to reset your password.
        </p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-5 text-left pb-4">
          
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-black">Mapua Email Address</label>
            <input 
              type="email" 
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
              RESET PASSWORD
            </button>
            <p className="text-sm text-gray-700">
              <Link href="/login" className="font-bold text-black hover:underline">
                Back to Log in
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Reset Email Popup */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-black mb-3 uppercase tracking-wide">Check Your Inbox</h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
            We have sent a password reset link to your Mapúa email address. Please check your inbox and click the link to reset your password.
          </p>
        </div>
      </PopupDialog>

    </div>
  );
}

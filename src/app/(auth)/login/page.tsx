'use client';

import Link from 'next/link';

export default function LoginPage() {
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
        
        {/* Huge Title - Scaled for mobile up to desktop */}
        <h1 className="text-[3.5rem] sm:text-[6rem] md:text-[9rem] lg:text-[11rem] xl:text-[13rem] font-black text-black tracking-[5%] mb-6 sm:mb-8 md:mb-12 leading-none">
          MapúOne
        </h1>
        
        {/* Subtitle / Description */}
        <p className="text-black font-bold max-w-4xl mb-8 sm:mb-12 text-xs sm:text-sm md:text-base leading-relaxed">
          A student complaint and feedback platform that gives Mapúa students a convenient and secure way to report concerns, submit complaints, and help improve the student experience.
        </p>

        {/* Form Container */}
        <form className="w-full max-w-md flex flex-col gap-4 text-left">
          <input 
            type="text" 
            placeholder="USERNAME"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-black placeholder-gray-500"
          />
          <input 
            type="password" 
            placeholder="PASSWORD"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-black placeholder-gray-500"
          />
          
          <div className="w-full text-left mt-1 mb-0">
            <Link 
              href="/forgot-password" 
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black uppercase"
            >
              FORGOT PASSWORD?
            </Link>
          </div>

          {/* Action Buttons - Stack full width on mobile, right aligned row on tablet+ */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-2">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-primary hover:bg-red-700 border border-black text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm text-center uppercase whitespace-nowrap"
            >
              CREATE ACCOUNT
            </Link>
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-[#2D2D2D] hover:bg-black text-white font-medium py-2.5 px-10 rounded-lg transition-colors text-sm uppercase"
            >
              LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

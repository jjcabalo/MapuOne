'use client';

import { useState } from 'react';
import Link from 'next/link';
import PopupDialog from '@/components/shared/PopupDialog';

export default function RegisterPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

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
        
        {/* Title - Scaled down to prevent scrolling */}
        <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] xl:text-[5.5rem] font-black text-black tracking-[5%] mb-2 md:mb-4 leading-none">
          MapúOne
        </h1>
        
        {/* Subtitle / Description */}
        <p className="text-black font-bold max-w-4xl mb-6 md:mb-8 text-xs sm:text-sm md:text-base leading-relaxed">
          Create your account to submit and track complaints or concerns.
        </p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col gap-4 md:gap-5 text-left pb-4">
          
          {/* Row 1 - Email Address */}
          <div className="flex flex-col md:flex-row gap-6 w-full md:w-1/2 md:pr-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">Mapua Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black"
              />
            </div>
          </div>

          {/* Row 2 - Passwords */}
          <div className="flex flex-col md:flex-row gap-6 w-full md:w-1/2 md:pr-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">Confirm Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black"
              />
            </div>
          </div>

          {/* Row 4 - Checkbox */}
          <div className="flex items-center gap-3 mt-2">
            <input 
              type="checkbox" 
              id="privacy-terms"
              required
              className="w-5 h-5 text-primary bg-white border-gray-400 rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="privacy-terms" className="text-xs sm:text-sm text-gray-700">
              I agree to the{' '}
              <button 
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="font-bold text-black hover:underline focus:outline-none"
              >
                data privacy terms
              </button>
              {' '}of MapúOne.
            </label>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4">
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-primary hover:bg-red-700 border border-black text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm text-center uppercase whitespace-nowrap"
            >
              CREATE ACCOUNT
            </button>
            <p className="text-sm text-gray-700">
              Already have Account?{' '}
              <Link href="/login" className="font-bold text-black hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Activation Email Popup */}
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
            We have sent an activation link to your Mapúa email address. Please click the link inside the email to verify and activate your account.
          </p>
        </div>
      </PopupDialog>

      {/* Privacy Terms Popup */}
      <PopupDialog
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        hideHeader={true}
        maxWidth="max-w-3xl"
        footer={
          <div className="w-full flex justify-end px-2 pb-2 mt-4 border-t border-gray-200 pt-6">
            <button 
              onClick={() => setIsTermsOpen(false)}
              className="px-10 py-3 bg-black hover:bg-[#2D2D2D] text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide w-full sm:w-auto"
            >
              I Understand & Agree
            </button>
          </div>
        }
      >
        <div className="flex flex-col text-left font-poppins">
          
          {/* Custom Header Area */}
          <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b-4 border-black">
            <h2 className="text-2xl sm:text-4xl font-black text-black tracking-[2%] uppercase leading-none">
              Data Privacy Terms
            </h2>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs sm:text-sm tracking-wide">
              MapúOne Feedback & Complaints Platform
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="space-y-6 text-sm sm:text-base text-gray-800 leading-relaxed pr-2">
            
            <p className="font-medium">
              MapúOne is committed to protecting your privacy and ensuring the security of your personal data. By registering for and using the MapúOne platform, you acknowledge and agree to the collection, processing, and storage of your personal data in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and Mapúa University's Data Privacy Policies.
            </p>

            <div>
              <h3 className="font-black text-black uppercase tracking-wide mb-2 text-lg">1. Information We Collect</h3>
              <p className="mb-2">To provide a secure and verifiable environment for community concerns, we collect the following personal information upon registration and usage:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li><strong>Identity Data:</strong> Full Name, ID Number, and Course/Department/Office.</li>
                <li><strong>Contact Data:</strong> Official Mapúa Email Address.</li>
                <li><strong>Platform Data:</strong> The content of your complaints, feedback, documents attached, and communication logs with university departments.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-black uppercase tracking-wide mb-2 text-lg">2. Purpose and Usage of Data</h3>
              <p className="mb-2">Your information is strictly utilized to facilitate the core functions of MapúOne:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>To verify your identity as a bona fide member of the Mapúa University community.</li>
                <li>To process, evaluate, and act upon the complaints, feedback, or concerns you submit.</li>
                <li>To route your specific concerns to the appropriate university departments or officials on a strict need-to-know basis.</li>
                <li>To monitor the resolution progress and provide you with updates.</li>
                <li>To generate anonymized, aggregated statistical reports for university administration to improve the campus experience.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-black uppercase tracking-wide mb-2 text-lg">3. Data Sharing and Disclosure</h3>
              <p>
                MapúOne does not sell, rent, or trade your personal information. Your identity and the details of your complaints are treated with utmost confidentiality. Information is only disclosed to authorized Mapúa University personnel (such as department heads, guidance counselors, or disciplinary boards) who are directly involved in addressing your submitted concern. We will not disclose your information to third parties without your explicit consent, except as required by law.
              </p>
            </div>

            <div>
              <h3 className="font-black text-black uppercase tracking-wide mb-2 text-lg">4. Data Protection and Security</h3>
              <p>
                We implement robust technical and organizational security measures to protect your personal data against unauthorized access, unlawful processing, accidental loss, destruction, or damage. Access to the MapúOne database is strictly restricted and monitored.
              </p>
            </div>

            <div>
              <h3 className="font-black text-black uppercase tracking-wide mb-2 text-lg">5. Data Retention</h3>
              <p>
                Your personal data and submitted concerns will be retained only for as long as necessary to fulfill the purposes for which they were collected, or as required by legitimate academic and legal purposes of Mapúa University, after which they will be securely deleted or anonymized.
              </p>
            </div>

            <div>
              <h3 className="font-black text-black uppercase tracking-wide mb-2 text-lg">6. Your Rights as a Data Subject</h3>
              <p>
                Under the Data Privacy Act, you have the right to be informed, to access, to object, to erasure or blocking, to damages, to file a complaint, to rectify, and to data portability. For any inquiries regarding your data privacy rights on MapúOne, you may contact the Mapúa University Data Protection Officer (DPO).
              </p>
            </div>

          </div>
        </div>
      </PopupDialog>

    </div>
  );
}

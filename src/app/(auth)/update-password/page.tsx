'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PopupDialog from '@/components/shared/PopupDialog';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Supabase automatically parses the session token from the URL hash
    // We just need to fetch the current user to display their email
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      } else {
        // If there's no user, they didn't come from a valid reset link
        setError('Invalid or expired password reset link. Please try again.');
      }
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('No valid session found. Please request a new reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) throw updateError;
      
      setIsPopupOpen(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password.');
    } finally {
      setIsLoading(false);
    }
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

      {/* Content Container */}
      <div className="flex-1 flex flex-col items-start px-6 sm:px-10 md:px-14 pt-6 sm:pt-8 md:pt-10 w-full text-left overflow-x-hidden">
        
        {/* Title */}
        <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] xl:text-[5.5rem] font-black text-black tracking-[5%] mb-2 md:mb-4 leading-none">
          MapúOne
        </h1>
        
        {/* Subtitle / Description */}
        <p className="text-black font-bold max-w-4xl mb-6 md:mb-8 text-xs sm:text-sm md:text-base leading-relaxed">
          Update the password for your account.
        </p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-5 text-left pb-4">
          
          {error && (
            <div className="w-full p-3 text-sm text-white bg-red-500 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-black">Mapua Email Address</label>
            <input 
              type="email" 
              value={email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none text-sm cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-black">New Password</label>
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-black">Confirm New Password</label>
            <div className="relative w-full">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-2">
            <button 
              type="submit" 
              disabled={isLoading || !email}
              className="w-full sm:w-auto bg-primary hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed border border-black text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm text-center uppercase whitespace-nowrap"
            >
              {isLoading ? 'UPDATING...' : 'CHANGE PASSWORD'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      <PopupDialog
        isOpen={isPopupOpen}
        hideHeader={true}
        onClose={() => {
          setIsPopupOpen(false);
          router.push('/login');
        }}
        maxWidth="max-w-md"
        footer={
          <div className="w-full flex justify-center px-4 pb-2">
            <button 
              onClick={() => {
                setIsPopupOpen(false);
                router.push('/login');
              }}
              className="px-10 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide w-full md:w-auto text-center block"
            >
              Go to Log in
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <div className="w-20 h-20 bg-[#D1F0D4] text-[#10B981] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-black mb-3 uppercase tracking-wide">Password Updated</h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
            Your password has been changed successfully. You can now log in with your new password.
          </p>
        </div>
      </PopupDialog>

    </div>
  );
}

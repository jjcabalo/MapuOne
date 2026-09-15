'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PopupDialog from '@/components/shared/PopupDialog';
import { Eye, EyeOff } from 'lucide-react';

export default function MyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile({ ...data, email: session.user.email });
      }
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    
    // First verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: profile?.email,
      password: currentPassword
    });

    if (verifyError) {
      setPasswordError('Incorrect current password');
      setIsUpdatingPassword(false);
      return;
    }

    // If verified, update to new password
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setPasswordError(error.message);
    } else {
      setIsPopupOpen(true);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    }
    setIsUpdatingPassword(false);
  };

  const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '';

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center h-full"><p>Loading profile...</p></div>;
  }

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
              <span className="text-white text-3xl font-black tracking-wider">{initials}</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-black">{profile?.first_name} {profile?.last_name}</h2>
              <p className="text-gray-600 text-sm font-medium">
                {profile?.role?.replace('_', ' ')} 
                {profile?.role === 'STUDENT' && profile?.course ? ` - ${profile.course}` : ''}
                {profile?.role !== 'STUDENT' && profile?.department ? ` - ${profile.department}` : ''}
              </p>
            </div>
          </div>

          {/* Form Fields - Disabled due to SSO */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Full Name</label>
                <input 
                  type="text" 
                  value={`${profile?.first_name || ''} ${profile?.last_name || ''}`}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 shadow-sm cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Student / Staff ID</label>
                <input 
                  type="text" 
                  value={profile?.id_number || profile?.student_number || 'N/A'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 shadow-sm cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Email Address</label>
                <input 
                  type="email" 
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 shadow-sm cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">
                  {profile?.role === 'STUDENT' ? 'Course / Program' : 'Department'}
                </label>
                <input 
                  type="text" 
                  value={profile?.role === 'STUDENT' ? (profile?.course || 'N/A') : (profile?.department || 'N/A')}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 shadow-sm cursor-not-allowed"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="border border-gray-400 rounded-3xl p-6 md:p-10 bg-white">
          <h2 className="text-xl font-black text-black mb-2">Change Password</h2>
          <p className="text-gray-600 text-sm mb-6">Updating password for: <strong>{profile?.email}</strong></p>
          
          <form className="flex flex-col gap-6" onSubmit={handleUpdatePassword}>
            {passwordError && (
              <div className="w-full p-3 text-sm text-white bg-red-500 rounded-lg">
                {passwordError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Current Password</label>
                <div className="relative w-full">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">New Password</label>
                <div className="relative w-full">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm pr-10"
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

              <div className="flex flex-col gap-2">
                <label className="text-black text-sm font-bold">Confirm New Password</label>
                <div className="relative w-full">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white shadow-sm pr-10"
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
            </div>

            {/* Save Button */}
            <div className="mt-4">
              <button 
                type="submit" 
                disabled={isUpdatingPassword}
                className="bg-[#222222] hover:bg-black disabled:bg-gray-400 text-white text-sm font-medium py-3 px-8 rounded-lg transition-colors"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>

      <PopupDialog
        isOpen={isPopupOpen}
        hideHeader={true}
        onClose={() => setIsPopupOpen(false)}
        maxWidth="max-w-md"
        footer={
          <div className="w-full flex justify-center px-4 pb-2">
            <button 
              onClick={() => setIsPopupOpen(false)}
              className="px-10 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide w-full md:w-auto text-center block"
            >
              Okay
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
            Your account password has been successfully updated.
          </p>
        </div>
      </PopupDialog>

    </div>
  );
}

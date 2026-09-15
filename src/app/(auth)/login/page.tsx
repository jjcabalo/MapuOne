'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('type=signup')) {
      setSuccess('Email confirmed successfully! You may now log in.');
      // Clean up the hash so it doesn't persist
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 2. Fetch the user's role from our public.users table to handle routing
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        localStorage.setItem('justLoggedIn', 'true');
        // Default fallback if profile fetch fails
        router.push('/user/dashboard');
        return;
      }

      localStorage.setItem('justLoggedIn', 'true');

      // 3. Role-Based Access Control Routing (RBAC)
      if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || profile?.role === 'HANDLER') {
        router.push('/admin/queue');
      } else {
        router.push('/user/dashboard');
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
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
        <form onSubmit={handleLogin} className="w-full max-w-md flex flex-col gap-4 text-left">
          
          {error && (
            <div className="w-full p-3 text-sm text-white bg-red-500 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="w-full p-3 text-sm text-white bg-green-500 rounded-lg">
              {success}
            </div>
          )}

          <input 
            type="email" 
            placeholder="MAPUA EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-black placeholder-gray-500"
          />
          <div className="relative w-full">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-black placeholder-gray-500 pr-10"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
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
              className="w-full sm:w-auto bg-primary hover:bg-red-700 border border-black text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm text-center uppercase whitespace-nowrap flex items-center justify-center"
            >
              CREATE ACCOUNT
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#2D2D2D] hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-10 rounded-lg transition-colors text-sm uppercase"
            >
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

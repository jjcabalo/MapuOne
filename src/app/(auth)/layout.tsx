'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Allow users to stay on update-password page even if they have a session from the recovery link
      if (pathname === '/update-password') {
        setIsChecking(false);
        return;
      }

      // If user just confirmed email, sign them out so they are forced to log in manually as requested
      if (typeof window !== 'undefined' && window.location.hash.includes('type=signup')) {
        await supabase.auth.signOut();
        setIsChecking(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is already logged in, they shouldn't be on the login/register pages
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || profile?.role === 'HANDLER') {
          router.push('/admin/queue');
        } else {
          router.push('/user/dashboard');
        }
      } else {
        // No session found, safe to show the auth pages
        setIsChecking(false);
      }
    };

    checkSession();
  }, [router]);

  // Prevent flashing the login screen for a split second while we check the session
  if (isChecking) {
    return <div className="min-h-screen bg-white" />;
  }

  return <>{children}</>;
}

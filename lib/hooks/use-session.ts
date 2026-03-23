'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  email: string;
}

export function useSession(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
          if (requireAuth) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
        if (requireAuth) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    // Listen for storage events (cross-tab session sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session-changed') {
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [requireAuth, router, pathname]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);

      // Trigger storage event to notify other tabs/components
      localStorage.setItem('session-changed', Date.now().toString());
      localStorage.removeItem('session-changed');

      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return { user, loading, logout };
}

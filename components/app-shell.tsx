'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isLoginPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, isLoading, isLoginPage, router]);

  // Login page - no shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto mobile-content-pad md:!pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

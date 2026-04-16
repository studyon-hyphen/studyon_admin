'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  Armchair,
  CalendarCheck,
  BarChart3,
  Trophy,
  Bell,
  Tv,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/students', label: '학생 관리', icon: Users },
  { href: '/seats', label: '좌석 현황', icon: Armchair },
  { href: '/attendance', label: '출결 관리', icon: CalendarCheck },
  { href: '/analytics', label: '분석', icon: BarChart3 },
  { href: '/rankings', label: '랭킹', icon: Trophy },
  { href: '/notifications', label: '알림', icon: Bell },
  { href: '/tv', label: 'TV 제어', icon: Tv },
  { href: '/settings', label: '설정', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex w-[240px] flex-col bg-white border-r border-card-border shrink-0">
      {/* Brand */}
      <div className="px-6 py-7">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-extrabold">S</span>
          </div>
          <div>
            <p className="text-[15px] font-extrabold text-text-primary tracking-tight">자습ON</p>
            <p className="text-[11px] text-text-tertiary font-medium">관리자 콘솔</p>
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-divider" />

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-text-tertiary tracking-widest uppercase mb-2">메뉴</p>
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-primary-surface text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={active ? 'text-primary' : 'text-text-tertiary'}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin info */}
      <div className="mx-3 mb-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-bg">
          <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{user?.name?.[0] ?? '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.name ?? '관리자'}</p>
            <p className="text-[11px] text-text-tertiary">{user?.role === 'DIRECTOR' ? '원장' : '관리자'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-text-tertiary hover:text-hot transition-colors"
            title="로그아웃"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

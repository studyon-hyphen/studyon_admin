'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Armchair, CalendarCheck, BarChart3,
} from 'lucide-react';

const TABS = [
  { href: '/', label: '홈', icon: LayoutDashboard },
  { href: '/students', label: '학생', icon: Users },
  { href: '/seats', label: '좌석', icon: Armchair },
  { href: '/attendance', label: '출결', icon: CalendarCheck },
  { href: '/analytics', label: '분석', icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const activeIdx = TABS.findIndex(t => t.href === pathname || (t.href !== '/' && pathname.startsWith(t.href)));

  return (
    <nav className="md:hidden fixed bottom-[var(--nav-bottom-offset)] left-4 right-4 z-50 safe-bottom">
      <div className="relative bg-white/80 backdrop-blur-2xl backdrop-saturate-[1.8] rounded-[22px] border border-white/60 px-2 py-1.5"
        style={{
          boxShadow: '0 2px 32px rgba(108,92,231,0.10), 0 0 1px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
        }}
      >
        {/* Sliding indicator */}
        {activeIdx >= 0 && (
          <div
            className="absolute top-1.5 h-[calc(100%-12px)] rounded-2xl bg-primary/[0.08] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
              left: `calc(${(activeIdx / TABS.length) * 100}% + 8px)`,
              width: `calc(${100 / TABS.length}% - 16px)`,
            }}
          />
        )}

        <ul className="flex items-center relative">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`relative flex flex-col items-center justify-center py-2 gap-[3px] rounded-2xl transition-colors duration-200 ${
                    active
                      ? 'text-primary'
                      : 'text-[#ADB5BD] active:text-[#868E96]'
                  }`}
                >
                  <Icon
                    size={active ? 23 : 22}
                    strokeWidth={active ? 2.3 : 1.6}
                    className={`transition-all duration-200 ${active ? 'drop-shadow-[0_1px_2px_rgba(108,92,231,0.3)]' : ''}`}
                  />
                  <span className={`text-[10px] leading-none tracking-tight transition-all duration-200 ${
                    active ? 'font-extrabold text-primary' : 'font-medium'
                  }`}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

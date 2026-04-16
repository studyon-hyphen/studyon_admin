'use client';
import { useState, useEffect } from 'react';
import { getDashboard, getSeats, getRankings, getStudents, getAttendanceStatsApi } from '@/lib/api';
import type { DashboardResponse, SeatResponse, RankingsResponse, AttendanceStatsResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  Users, Armchair, UserX, TrendingUp, ChevronRight, Trophy,
  CalendarCheck, BookOpen, Bell, Settings, Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [rankings, setRankings] = useState<RankingsResponse | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [attStats, setAttStats] = useState<AttendanceStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      getDashboard().catch(() => null),
      getSeats().catch(() => []),
      getRankings('DAILY', 'STUDY_TIME').catch(() => null),
      getStudents().then(s => s.length).catch(() => 0),
      getAttendanceStatsApi({ startDate: today, endDate: today }).catch(() => null),
    ]).then(([dash, seatList, rank, count, att]) => {
      setDashboard(dash);
      setSeats(seatList);
      setRankings(rank);
      setStudentCount(count);
      setAttStats(att);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후에요' : '수고하셨어요';
  const totalSeats = seats.length;
  const occupiedSeats = seats.filter(s => s.status === 'OCCUPIED').length;
  const availableSeats = seats.filter(s => s.status === 'AVAILABLE').length;
  const occupancy = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  if (loading) {
    return (
      <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-5 w-32" />
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      {/* ─── Mobile Hero Header ─── */}
      <div className="md:hidden mb-6">
        <div className="gradient-hero rounded-3xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <p className="text-white/70 text-xs font-medium mb-0.5">
            {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          <h1 className="text-xl font-bold mb-1">{greeting} <span className="toss-face">👋</span></h1>
          <p className="text-white/80 text-sm">{user?.name ?? '관리자'}님</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/15 rounded-xl px-3 py-2 flex-1 text-center backdrop-blur-sm">
              <p className="text-lg font-extrabold tabular-nums">{dashboard?.checkedInCount ?? 0}</p>
              <p className="text-[10px] text-white/70 font-medium">현재 입실</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 flex-1 text-center backdrop-blur-sm">
              <p className="text-lg font-extrabold tabular-nums">{availableSeats}</p>
              <p className="text-[10px] text-white/70 font-medium">빈 좌석</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 flex-1 text-center backdrop-blur-sm">
              <p className="text-lg font-extrabold tabular-nums">{studentCount}</p>
              <p className="text-[10px] text-white/70 font-medium">전체 학생</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop Header ─── */}
      <div className="hidden md:flex items-end justify-between mb-8">
        <div>
          <p className="text-sm text-text-tertiary mb-1">
            {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {greeting}, <span className="gradient-text">{user?.name ?? '관리자'}</span>님
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-light border border-accent/20">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
          <span className="text-xs font-semibold text-accent">실시간 운영 중</span>
        </div>
      </div>

      {/* ─── Mobile Quick Actions (horizontal scroll) ─── */}
      <div className="md:hidden mb-5">
        <div className="scroll-snap-x flex gap-2 -mx-5 px-5">
          {[
            { href: '/students', label: '학생 관리', icon: Users, color: 'text-primary', bg: 'bg-primary-surface' },
            { href: '/notifications', label: '알림 발송', icon: Bell, color: 'text-warm', bg: 'bg-warm-light' },
            { href: '/rankings', label: '랭킹', icon: Trophy, color: 'text-gold', bg: 'bg-warm-light' },
            { href: '/settings', label: '설정', icon: Settings, color: 'text-sky', bg: 'bg-sky-light' },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="scroll-snap-item flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 border border-card-border card-shadow press-scale shrink-0"
            >
              <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center`}>
                <a.icon size={16} className={a.color} />
              </div>
              <span className="text-sm font-semibold text-text-primary whitespace-nowrap">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Desktop KPI Cards ─── */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-6 stagger-children">
        {[
          {
            label: '현재 입실', value: dashboard?.checkedInCount ?? 0, unit: `/ ${totalSeats || '-'}석`,
            icon: Users, iconColor: 'text-primary', iconBg: 'bg-primary-surface',
            bar: totalSeats > 0, barPct: occupancy, barLabel: `${occupancy}% 점유`,
          },
          {
            label: '빈 좌석', value: availableSeats, unit: '석',
            icon: Armchair, iconColor: 'text-accent', iconBg: 'bg-accent-light',
          },
          {
            label: '등록 학생', value: studentCount, unit: '명',
            icon: BookOpen, iconColor: 'text-warm', iconBg: 'bg-warm-light',
          },
          {
            label: '미입실', value: dashboard?.notCheckedInStudents ?? 0, unit: '명',
            icon: UserX, iconColor: 'text-hot', iconBg: 'bg-hot-light',
          },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-tertiary">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon size={16} className={kpi.iconColor} />
              </div>
            </div>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-3xl font-extrabold text-text-primary tabular-nums leading-none">{kpi.value}</span>
              <span className="text-sm text-text-tertiary font-medium mb-0.5">{kpi.unit}</span>
            </div>
            {kpi.bar && (
              <>
                <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-progress" style={{ width: `${kpi.barPct}%` }} />
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 tabular-nums">{kpi.barLabel}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ─── Mobile: 오늘 출결 요약 ─── */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary">오늘 출결</h2>
          <Link href="/attendance" className="text-xs font-semibold text-text-tertiary flex items-center gap-0.5">
            상세 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-4 border border-card-border card-shadow text-center press-scale">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-2">
              <CalendarCheck size={15} className="text-accent" />
            </div>
            <p className="text-xl font-extrabold text-accent tabular-nums">{attStats?.checkedIn ?? 0}</p>
            <p className="text-[10px] font-semibold text-text-tertiary mt-0.5">출석</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-card-border card-shadow text-center press-scale">
            <div className="w-8 h-8 rounded-full bg-warm-light flex items-center justify-center mx-auto mb-2">
              <Clock size={15} className="text-warm" />
            </div>
            <p className="text-xl font-extrabold text-warm tabular-nums">{attStats?.late ?? 0}</p>
            <p className="text-[10px] font-semibold text-text-tertiary mt-0.5">지각</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-card-border card-shadow text-center press-scale">
            <div className="w-8 h-8 rounded-full bg-hot-light flex items-center justify-center mx-auto mb-2">
              <UserX size={15} className="text-hot" />
            </div>
            <p className="text-xl font-extrabold text-hot tabular-nums">{dashboard?.notCheckedInStudents ?? 0}</p>
            <p className="text-[10px] font-semibold text-text-tertiary mt-0.5">미입실</p>
          </div>
        </div>
      </div>

      {/* ─── Mobile: 오늘 랭킹 (compact) ─── */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary">오늘 랭킹 <span className="toss-face">🏆</span></h2>
          <Link href="/rankings" className="text-xs font-semibold text-text-tertiary flex items-center gap-0.5">
            전체 <ChevronRight size={14} />
          </Link>
        </div>
        {!rankings?.items?.length ? (
          <div className="bg-white rounded-2xl p-8 border border-card-border card-shadow text-center">
            <p className="text-sm text-text-tertiary">아직 랭킹 데이터가 없습니다</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-card-border card-shadow overflow-hidden">
            {rankings.items.slice(0, 3).map((r, i) => (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3.5 press-scale ${i < 2 ? 'border-b border-card-border' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                  i === 0 ? 'bg-warm-light text-gold' :
                  i === 1 ? 'bg-gray-100 text-silver' :
                  'bg-orange-50 text-bronze'
                }`}>
                  {r.rankNo}
                </div>
                <span className="flex-1 text-sm font-bold text-text-primary truncate">
                  {r.student?.user?.name ?? '-'}
                </span>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {Math.floor(Number(r.score) / 60)}h {Number(r.score) % 60}m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Mobile: 좌석 현황 미니맵 ─── */}
      {seats.length > 0 && (
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary">좌석 현황</h2>
            <Link href="/seats" className="text-xs font-semibold text-text-tertiary flex items-center gap-0.5">
              관리 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-card-border card-shadow">
            {/* Occupancy bar */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-secondary font-medium">{occupiedSeats}/{totalSeats}석 사용 중</span>
              <span className="text-xs font-bold text-primary tabular-nums">{occupancy}%</span>
            </div>
            <div className="w-full h-2 bg-bg rounded-full overflow-hidden mb-4">
              <div className="h-full gradient-primary rounded-full animate-progress" style={{ width: `${occupancy}%` }} />
            </div>
            {/* Mini seat grid */}
            <div className="grid grid-cols-6 gap-1.5">
              {seats.slice(0, 18).map(seat => (
                <div
                  key={seat.id}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold ${
                    seat.status === 'OCCUPIED' ? 'bg-primary/15 text-primary' :
                    seat.status === 'LOCKED' ? 'bg-hot/10 text-hot/60' :
                    'bg-bg text-text-tertiary/60'
                  }`}
                >
                  {seat.seatNo}
                </div>
              ))}
              {seats.length > 18 && (
                <Link href="/seats" className="aspect-square rounded-lg bg-bg flex items-center justify-center text-[9px] font-semibold text-text-tertiary">
                  +{seats.length - 18}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop: Main grid (seat map + ranking + attendance) ─── */}
      <div className="hidden md:grid grid-cols-5 gap-6 mb-6">
        {/* Seat Map */}
        <div className="col-span-3 bg-white rounded-2xl p-6 border border-card-border card-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Armchair size={16} className="text-text-tertiary" />
              <p className="text-sm font-bold text-text-primary">좌석 현황</p>
              {totalSeats > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary-surface text-primary text-[10px] font-bold">{occupancy}%</span>
              )}
            </div>
            <Link href="/seats" className="flex items-center gap-0.5 text-xs font-semibold text-text-tertiary hover:text-primary transition-colors">
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>
          {seats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
              <Armchair size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">등록된 좌석이 없습니다</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {seats.map(seat => (
                  <div
                    key={seat.id}
                    className={`rounded-xl p-2.5 text-center transition-all hover:scale-105 ${
                      seat.status === 'OCCUPIED' ? 'bg-primary-surface border border-primary/10' :
                      seat.status === 'LOCKED' ? 'bg-hot-light border border-hot/10' :
                      seat.status === 'RESERVED' ? 'bg-warm-light border border-warm/10' :
                      'bg-bg border border-transparent'
                    }`}
                  >
                    <p className={`text-[11px] font-bold ${
                      seat.status === 'OCCUPIED' ? 'text-primary' :
                      seat.status === 'LOCKED' ? 'text-hot' :
                      seat.status === 'RESERVED' ? 'text-warm' : 'text-text-tertiary'
                    }`}>{seat.seatNo}</p>
                    {seat.currentStudent && (
                      <p className="text-[9px] text-text-tertiary mt-0.5 truncate">{seat.currentStudent.user.name}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-5 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-primary-surface border border-primary/20" />사용 중
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-bg border border-gray-200" />빈자리
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-hot-light border border-hot/20" />잠금
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Ranking */}
          <div className="bg-white rounded-2xl p-6 border border-card-border card-shadow flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-gold" />
                <p className="text-sm font-bold text-text-primary">오늘 랭킹</p>
              </div>
              <Link href="/rankings" className="flex items-center gap-0.5 text-xs font-semibold text-text-tertiary hover:text-primary transition-colors">
                전체 <ChevronRight size={14} />
              </Link>
            </div>
            {!rankings?.items?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-tertiary">
                <Trophy size={32} className="mb-2 opacity-20" />
                <p className="text-sm">아직 랭킹 데이터가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-1">
                {rankings.items.slice(0, 5).map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-bg transition-colors group">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                      i === 0 ? 'bg-warm-light text-gold' :
                      i === 1 ? 'bg-gray-100 text-silver' :
                      i === 2 ? 'bg-orange-50 text-bronze' :
                      'bg-bg text-text-tertiary'
                    }`}>
                      {r.rankNo}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {r.student?.user?.name ?? '-'}
                    </span>
                    <span className="text-sm font-bold text-text-secondary tabular-nums">
                      {Math.floor(Number(r.score) / 60)}h {Number(r.score) % 60}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-2xl p-6 border border-card-border card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck size={16} className="text-text-tertiary" />
                <p className="text-sm font-bold text-text-primary">오늘 출결</p>
              </div>
              <Link href="/attendance" className="flex items-center gap-0.5 text-xs font-semibold text-text-tertiary hover:text-primary transition-colors">
                상세 <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-accent-light/50">
                <p className="text-lg font-extrabold text-accent tabular-nums">{attStats?.checkedIn ?? 0}</p>
                <p className="text-[10px] font-semibold text-accent/70">출석</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-warm-light/50">
                <p className="text-lg font-extrabold text-warm tabular-nums">{attStats?.late ?? 0}</p>
                <p className="text-[10px] font-semibold text-warm/70">지각</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-hot-light/50">
                <p className="text-lg font-extrabold text-hot tabular-nums">{dashboard?.notCheckedInStudents ?? 0}</p>
                <p className="text-[10px] font-semibold text-hot/70">미입실</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop Quick Actions ─── */}
      <div className="hidden md:grid grid-cols-4 gap-3">
        {[
          { href: '/students', label: '학생 관리', desc: '등록/조회', icon: Users, color: 'text-primary', bg: 'bg-primary-surface' },
          { href: '/analytics', label: '분석', desc: '학습 통계', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent-light' },
          { href: '/notifications', label: '알림', desc: '공지 발송', icon: Bell, color: 'text-warm', bg: 'bg-warm-light' },
          { href: '/settings', label: '설정', desc: '운영 관리', icon: Settings, color: 'text-sky', bg: 'bg-sky-light' },
        ].map(action => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-2xl p-5 border border-card-border card-shadow card-hover flex items-center gap-3 group"
          >
            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
              <action.icon size={18} className={action.color} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{action.label}</p>
              <p className="text-[11px] text-text-tertiary">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

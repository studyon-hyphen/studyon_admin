'use client';
import { useState, useEffect } from 'react';
import { getStudyOverview, getAttendanceStatsApi, getDirectorOverview } from '@/lib/api';
import type { StudyMetric, AttendanceStatsResponse, DirectorOverviewResponse } from '@/lib/api';
import { BarChart3, Clock, Users, CalendarCheck, TrendingUp, BookOpen, Target, Flame } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<StudyMetric[]>([]);
  const [attStats, setAttStats] = useState<AttendanceStatsResponse | null>(null);
  const [overview, setOverview] = useState<DirectorOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    const endDate = new Date().toISOString().split('T')[0];
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startDate = start.toISOString().split('T')[0];

    Promise.all([
      getStudyOverview({ startDate, endDate }).catch(() => []),
      getAttendanceStatsApi({ startDate, endDate }).catch(() => null),
      getDirectorOverview().catch(() => null),
    ]).then(([m, a, o]) => {
      setMetrics(m);
      setAttStats(a);
      setOverview(o);
      setLoading(false);
    });
  }, [days]);

  // Aggregate metrics
  const totalStudyMinutes = metrics.reduce((s, m) => s + m.studyMinutes, 0);
  const totalBreakMinutes = metrics.reduce((s, m) => s + m.breakMinutes, 0);
  const totalPages = metrics.reduce((s, m) => s + m.pagesCompleted, 0);
  const totalProblems = metrics.reduce((s, m) => s + m.problemsSolved, 0);
  const uniqueStudents = new Set(metrics.map(m => m.studentId)).size;
  const avgStudyPerStudent = uniqueStudents > 0 ? Math.round(totalStudyMinutes / uniqueStudents) : 0;

  // Daily aggregation for chart
  const dailyMap = new Map<string, { study: number; attendance: number; count: number }>();
  metrics.forEach(m => {
    const dateKey = m.metricDate.split('T')[0];
    const existing = dailyMap.get(dateKey) ?? { study: 0, attendance: 0, count: 0 };
    existing.study += m.studyMinutes;
    existing.attendance += m.attendanceMinutes;
    existing.count += 1;
    dailyMap.set(dateKey, existing);
  });
  const dailyData = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: date.slice(5),
      day: new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' }),
      studyHours: Math.round(vals.study / 60 * 10) / 10,
      students: vals.count,
    }));
  const maxStudyHours = Math.max(...dailyData.map(d => d.studyHours), 1);

  // Student ranking by study time
  const studentMap = new Map<string, { name: string; minutes: number; sessions: number; streak: number }>();
  metrics.forEach(m => {
    const existing = studentMap.get(m.studentId) ?? { name: m.student?.user?.name ?? '-', minutes: 0, sessions: 0, streak: 0 };
    existing.minutes += m.studyMinutes;
    existing.sessions += m.studySessionCount;
    existing.streak = Math.max(existing.streak, m.streakDays);
    studentMap.set(m.studentId, existing);
  });
  const studentRanking = Array.from(studentMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.minutes - a.minutes);

  // Attendance status breakdown
  const attBreakdown = {
    present: metrics.filter(m => m.attendanceStatus === 'PRESENT').length,
    late: metrics.filter(m => m.attendanceStatus === 'LATE').length,
    absent: metrics.filter(m => m.attendanceStatus === 'ABSENT').length,
  };
  const attTotal = attBreakdown.present + attBreakdown.late + attBreakdown.absent;
  const attRate = attTotal > 0 ? Math.round(((attBreakdown.present + attBreakdown.late) / attTotal) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="분석" description="학습 통계와 트렌드" icon={BarChart3} />

      {/* Period selector */}
      <div className="flex bg-bg rounded-xl p-1 mb-6 w-full md:w-fit border border-card-border">
        {[
          { value: 7, label: '7일' },
          { value: 14, label: '14일' },
          { value: 30, label: '30일' },
        ].map(p => (
          <button
            key={p.value}
            onClick={() => setDays(p.value)}
            className={`flex-1 md:flex-none px-5 py-2 md:py-1.5 rounded-lg text-sm font-semibold transition-all press-scale ${
              days === p.value ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 stagger-children">
            <div className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-text-tertiary">총 공부시간</span>
                <div className="w-7 h-7 rounded-lg bg-primary-surface flex items-center justify-center">
                  <Clock size={14} className="text-primary" />
                </div>
              </div>
              <p className="text-2xl font-extrabold tabular-nums text-text-primary">{formatMinutes(totalStudyMinutes)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-text-tertiary">출석률</span>
                <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center">
                  <CalendarCheck size={14} className="text-accent" />
                </div>
              </div>
              <p className="text-2xl font-extrabold tabular-nums text-text-primary">{attRate}%</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-text-tertiary">활성 학생</span>
                <div className="w-7 h-7 rounded-lg bg-warm-light flex items-center justify-center">
                  <Users size={14} className="text-warm" />
                </div>
              </div>
              <p className="text-2xl font-extrabold tabular-nums text-text-primary">{overview?.activeStudentCount ?? uniqueStudents}명</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-text-tertiary">1인 평균</span>
                <div className="w-7 h-7 rounded-lg bg-sky-light flex items-center justify-center">
                  <TrendingUp size={14} className="text-sky" />
                </div>
              </div>
              <p className="text-2xl font-extrabold tabular-nums text-text-primary">{formatMinutes(avgStudyPerStudent)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Daily Chart */}
            <div className="bg-white rounded-2xl p-6 border border-card-border card-shadow">
              <h3 className="text-sm font-bold text-text-primary mb-5">일별 공부시간</h3>
              {dailyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-text-tertiary">
                  <BarChart3 size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">데이터가 아직 없습니다</p>
                </div>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {dailyData.map((d, idx) => {
                    const heightPct = Math.round((d.studyHours / maxStudyHours) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] text-text-secondary font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.studyHours}h
                        </span>
                        <div
                          className="w-full rounded-xl transition-all cursor-default gradient-primary group-hover:opacity-80"
                          style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: d.studyHours > 0 ? '6px' : '2px' }}
                        />
                        <div className="text-center">
                          <span className="text-[10px] text-text-tertiary font-medium block">{d.day}</span>
                          <span className="text-[9px] text-text-tertiary tabular-nums">{d.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attendance Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-card-border card-shadow">
              <h3 className="text-sm font-bold text-text-primary mb-5">출결 현황</h3>
              {attTotal === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-text-tertiary">
                  <CalendarCheck size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">출결 데이터가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    { label: '출석', count: attBreakdown.present, color: '#00B894', bg: 'bg-accent-light' },
                    { label: '지각', count: attBreakdown.late, color: '#FDCB6E', bg: 'bg-warm-light' },
                    { label: '결석', count: attBreakdown.absent, color: '#E17055', bg: 'bg-hot-light' },
                  ].map(item => {
                    const pct = Math.round((item.count / attTotal) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-md" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-text-primary">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums text-text-secondary font-bold">{item.count}건</span>
                            <span className="tabular-nums text-text-tertiary text-xs">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-bg rounded-full h-2">
                          <div
                            className="h-2 rounded-full animate-progress"
                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary ring */}
                  <div className="flex items-center justify-center pt-2">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#F2F3F5" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="40" fill="none" stroke="#00B894" strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${attRate * 2.51} ${251 - attRate * 2.51}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-extrabold text-text-primary tabular-nums">{attRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Clock, label: '총 휴식시간', value: formatMinutes(totalBreakMinutes), color: 'text-warm', bg: 'bg-warm-light' },
              { icon: BookOpen, label: '완료 페이지', value: `${totalPages}p`, color: 'text-primary', bg: 'bg-primary-surface' },
              { icon: Target, label: '풀이 문제', value: `${totalProblems}개`, color: 'text-accent', bg: 'bg-accent-light' },
              { icon: Flame, label: '기록 건수', value: `${metrics.length}건`, color: 'text-hot', bg: 'bg-hot-light' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-card-border card-shadow text-center">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <p className="text-lg font-extrabold tabular-nums text-text-primary">{stat.value}</p>
                <p className="text-[11px] font-semibold text-text-tertiary mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Student Ranking Table */}
          <div className="bg-white rounded-2xl p-6 border border-card-border card-shadow">
            <h3 className="text-sm font-bold text-text-primary mb-5">학생별 학습량</h3>
            {studentRanking.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                <Users size={32} className="mb-2 opacity-30" />
                <p className="text-sm">학습 데이터가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-0">
                {studentRanking.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 py-3 ${idx !== studentRanking.length - 1 ? 'border-b border-divider/50' : ''}`}
                  >
                    <span className="w-6 text-center text-sm font-bold tabular-nums text-text-tertiary">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center">
                      <span className="text-[11px] font-bold text-primary">{s.name[0]}</span>
                    </div>
                    <span className="flex-1 font-semibold text-text-primary text-sm">{s.name}</span>
                    <span className="text-xs text-text-tertiary tabular-nums">{s.sessions}회</span>
                    <span className="tabular-nums font-bold text-primary text-sm min-w-[70px] text-right">
                      {formatMinutes(s.minutes)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

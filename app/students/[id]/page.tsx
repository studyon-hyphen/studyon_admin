'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStudent, getStudentStudySummary } from '@/lib/api';
import type { StudentResponse } from '@/lib/api';
import { ArrowLeft, Clock, Flame, Target, CalendarCheck } from 'lucide-react';

interface DayMetric {
  metricDate: string;
  studyMinutes: number;
  attendanceMinutes: number;
  attendanceStatus: string;
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [metrics, setMetrics] = useState<DayMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      const id = String(params.id);
      Promise.all([
        getStudent(id).catch(() => null),
        getStudentStudySummary(id).then(d => d.metrics ?? []).catch(() => []),
      ]).then(([s, m]) => {
        setStudent(s);
        setMetrics(m);
        setLoading(false);
      });
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <p className="text-text-tertiary text-sm">학생 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const totalStudyMinutes = metrics.reduce((acc, m) => acc + m.studyMinutes, 0);
  const attendanceDays = metrics.filter(m => m.attendanceStatus === 'PRESENT' || m.attendanceStatus === 'LATE').length;
  const avgMinutes = metrics.length > 0 ? Math.round(totalStudyMinutes / metrics.length) : 0;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium mb-6"
      >
        <ArrowLeft size={16} />
        뒤로
      </button>

      {/* Profile header */}
      <div className="bg-white rounded-2xl p-6 border border-card-border card-shadow mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-surface flex items-center justify-center">
            <span className="text-xl font-bold text-primary">{student.user.name[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-xl font-bold text-text-primary">{student.user.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                student.enrollmentStatus === 'ACTIVE'
                  ? 'bg-accent-light text-accent'
                  : 'bg-bg text-text-tertiary'
              }`}>
                {student.enrollmentStatus === 'ACTIVE' ? '재학' : '비활성'}
              </span>
            </div>
            <p className="text-sm text-text-tertiary">
              {[student.grade?.name, student.class?.name, student.group?.name].filter(Boolean).join(' · ') || '미배정'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger-children">
        {[
          { icon: Clock, label: '총 공부시간', value: `${(totalStudyMinutes / 60).toFixed(1)}h`, iconColor: 'text-primary', iconBg: 'bg-primary-surface' },
          { icon: CalendarCheck, label: '출석 일수', value: `${attendanceDays}일`, iconColor: 'text-accent', iconBg: 'bg-accent-light' },
          { icon: Flame, label: '일 평균', value: `${(avgMinutes / 60).toFixed(1)}h`, iconColor: 'text-hot', iconBg: 'bg-hot-light' },
          { icon: Target, label: '기록 일수', value: `${metrics.length}일`, iconColor: 'text-warm', iconBg: 'bg-warm-light' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-text-tertiary">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon size={14} className={stat.iconColor} />
              </div>
            </div>
            <p className="text-2xl font-extrabold tabular-nums text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div className="bg-white rounded-2xl p-6 border border-card-border card-shadow">
        <div className="flex items-center gap-2 mb-5">
          <CalendarCheck size={16} className="text-text-tertiary" />
          <h3 className="text-sm font-bold text-text-primary">최근 활동</h3>
        </div>

        {metrics.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-8">활동 기록이 없습니다.</p>
        ) : (
          <div className="space-y-0">
            {metrics.slice(0, 14).map((m, idx) => (
              <div
                key={m.metricDate}
                className={`flex gap-6 py-3.5 ${idx !== Math.min(metrics.length, 14) - 1 ? 'border-b border-divider/50' : ''}`}
              >
                <div className="w-24 shrink-0">
                  <p className="text-xs font-semibold text-text-tertiary tabular-nums">{m.metricDate.slice(5)}</p>
                </div>
                <div className="flex-1 flex items-center gap-4 text-sm">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                    m.attendanceStatus === 'PRESENT' ? 'bg-accent-light text-accent' :
                    m.attendanceStatus === 'LATE' ? 'bg-warm-light text-warm' :
                    m.attendanceStatus === 'ABSENT' ? 'bg-hot-light text-hot' :
                    'bg-bg text-text-tertiary'
                  }`}>
                    {m.attendanceStatus === 'PRESENT' ? '출석' :
                     m.attendanceStatus === 'LATE' ? '지각' :
                     m.attendanceStatus === 'ABSENT' ? '결석' : m.attendanceStatus}
                  </span>
                  <span className="ml-auto font-bold tabular-nums text-primary">
                    {m.studyMinutes > 0
                      ? `${Math.floor(m.studyMinutes / 60)}h ${m.studyMinutes % 60}m`
                      : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

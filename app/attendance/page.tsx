'use client';
import { useState, useEffect } from 'react';
import { getAttendances } from '@/lib/api';
import type { AttendanceResponse } from '@/lib/api';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const statusConfig: Record<string, { dot: string; text: string; label: string; bg: string }> = {
  PRESENT: { dot: 'bg-accent', text: 'text-accent', label: '출석', bg: 'bg-accent-light' },
  LATE: { dot: 'bg-warm', text: 'text-warm', label: '지각', bg: 'bg-warm-light' },
  ABSENT: { dot: 'bg-hot', text: 'text-hot', label: '결석', bg: 'bg-hot-light' },
  CHECKED_IN: { dot: 'bg-primary', text: 'text-primary', label: '재실', bg: 'bg-primary-surface' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function formatTime(iso: string | null): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [data, setData] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAttendances({ date }).then(setData).catch(() => setData([])).finally(() => setLoading(false));
  }, [date]);

  const navigateDate = (dir: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(d.toISOString().split('T')[0]);
  };

  const present = data.filter(r => r.attendanceStatus === 'PRESENT' || r.attendanceStatus === 'CHECKED_IN').length;
  const late = data.filter(r => r.lateStatus === 'LATE').length;
  const absent = data.filter(r => r.attendanceStatus === 'ABSENT').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="출석 관리" icon={CalendarCheck} />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 bg-white rounded-xl px-2 py-1.5 border border-card-border card-shadow">
          <button
            onClick={() => navigateDate(-1)}
            className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-bg"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-text-primary min-w-[130px] text-center tabular-nums">
            {formatDate(date)}
          </span>
          <button
            onClick={() => navigateDate(1)}
            className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-bg"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Summary badges */}
        {data.length > 0 && (
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-accent-light text-accent text-xs font-semibold">출석 {present}</span>
            {late > 0 && <span className="px-3 py-1.5 rounded-lg bg-warm-light text-warm text-xs font-semibold">지각 {late}</span>}
            {absent > 0 && <span className="px-3 py-1.5 rounded-lg bg-hot-light text-hot text-xs font-semibold">결석 {absent}</span>}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-card-border card-shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-text-tertiary tracking-wide uppercase">이름</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-text-tertiary tracking-wide uppercase">입실</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-text-tertiary tracking-wide uppercase">퇴실</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-text-tertiary tracking-wide uppercase">체류시간</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-text-tertiary tracking-wide uppercase">상태</th>
                </tr>
              </thead>
              <tbody>
                {data.map((record, idx) => {
                  const status = record.attendanceStatus;
                  const config = statusConfig[status] ?? statusConfig.PRESENT;
                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-bg/50 transition-colors ${idx !== data.length - 1 ? 'border-b border-divider/50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{record.student?.user?.name?.[0] ?? '?'}</span>
                          </div>
                          <span className="font-semibold text-text-primary">{record.student?.user?.name ?? '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 tabular-nums text-text-secondary font-medium">{formatTime(record.checkInAt)}</td>
                      <td className="px-6 py-4 tabular-nums text-text-secondary font-medium">{record.checkOutAt ? formatTime(record.checkOutAt) : '재실중'}</td>
                      <td className="px-6 py-4 tabular-nums text-text-primary font-semibold">
                        {record.stayMinutes > 0
                          ? `${Math.floor(record.stayMinutes / 60)}h ${record.stayMinutes % 60}m`
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.length === 0 && (
              <div className="text-center py-16 text-text-tertiary text-sm">출석 데이터가 없습니다.</div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {data.map(record => {
              const config = statusConfig[record.attendanceStatus] ?? statusConfig.PRESENT;
              return (
                <div key={record.id} className="bg-white rounded-2xl p-4 border border-card-border card-shadow press-scale">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{record.student?.user?.name?.[0] ?? '?'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-text-primary text-sm block">{record.student?.user?.name ?? '-'}</span>
                        <span className="text-[11px] text-text-tertiary font-medium">
                          {record.seat?.seatNo ? `${record.seat.seatNo}번` : ''}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${config.bg} ${config.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider/50">
                    <div className="flex gap-4 text-xs tabular-nums">
                      <div>
                        <span className="text-text-tertiary">입실 </span>
                        <span className="font-semibold text-text-secondary">{formatTime(record.checkInAt)}</span>
                      </div>
                      <div>
                        <span className="text-text-tertiary">퇴실 </span>
                        <span className="font-semibold text-text-secondary">{record.checkOutAt ? formatTime(record.checkOutAt) : '재실중'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {record.stayMinutes > 0
                        ? `${Math.floor(record.stayMinutes / 60)}h ${record.stayMinutes % 60}m`
                        : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
            {data.length === 0 && (
              <div className="bg-white rounded-2xl p-12 border border-card-border card-shadow text-center">
                <CalendarCheck size={32} className="text-text-tertiary mx-auto mb-2 opacity-30" />
                <p className="text-text-tertiary text-sm">출석 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

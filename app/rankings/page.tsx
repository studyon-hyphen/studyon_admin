'use client';
import { useState, useEffect } from 'react';
import { getRankings } from '@/lib/api';
import type { RankingsResponse } from '@/lib/api';
import { Trophy, Award, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY';
const periodLabel: Record<Period, string> = { DAILY: '일간', WEEKLY: '주간', MONTHLY: '월간' };

const rankStyle = (rank: number) => {
  if (rank === 1) return { color: 'text-gold', bg: 'bg-warm-light', border: 'border-gold/20' };
  if (rank === 2) return { color: 'text-silver', bg: 'bg-gray-100', border: 'border-silver/20' };
  if (rank === 3) return { color: 'text-bronze', bg: 'bg-orange-50', border: 'border-bronze/20' };
  return { color: 'text-text-tertiary', bg: 'bg-bg', border: 'border-transparent' };
};

export default function RankingsPage() {
  const [period, setPeriod] = useState<Period>('DAILY');
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [showAward, setShowAward] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRankings(period, 'STUDY_TIME').then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [period]);

  const items = data?.items ?? [];
  const top1 = items[0];

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <PageHeader
        title="랭킹"
        icon={Trophy}
        actions={
          <button
            onClick={() => setShowAward(true)}
            className="h-10 px-4 bg-warm-light text-warm text-sm font-semibold rounded-xl hover:bg-warm/10 border border-warm/20 transition-colors flex items-center gap-1.5"
          >
            <Award size={16} />
            시상하기
          </button>
        }
      />

      {/* Segmented control */}
      <div className="flex bg-bg rounded-xl p-1 mb-6 w-full md:w-fit border border-card-border">
        {(['DAILY', 'WEEKLY', 'MONTHLY'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 md:flex-none px-5 py-2 md:py-1.5 rounded-lg text-sm font-semibold transition-all press-scale ${
              period === p ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {periodLabel[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-card-border card-shadow text-center">
          <Trophy size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-tertiary text-sm">랭킹 데이터가 없습니다.</p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {items.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 stagger-children">
              {[items[1], items[0], items[2]].map((entry, vizIdx) => {
                const actualRank = vizIdx === 1 ? 1 : vizIdx === 0 ? 2 : 3;
                const style = rankStyle(actualRank);
                const minutes = Math.round(Number(entry.score));
                const isFirst = vizIdx === 1;
                return (
                  <div
                    key={entry.id}
                    className={`bg-white rounded-2xl p-4 md:p-5 border border-card-border card-shadow text-center press-scale ${isFirst ? '-mt-2 md:-mt-4' : 'mt-2 md:mt-0'}`}
                  >
                    {isFirst && (
                      <div className="text-lg mb-1 toss-face">👑</div>
                    )}
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center mx-auto ${isFirst ? 'mb-2' : 'mb-2 md:mb-3'}`}>
                      <span className={`text-base md:text-lg font-extrabold ${style.color}`}>{actualRank}</span>
                    </div>
                    <div className={`${isFirst ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-primary-surface flex items-center justify-center mx-auto mb-1.5 md:mb-2`}>
                      <span className={`${isFirst ? 'text-base' : 'text-sm'} font-bold text-primary`}>{entry.student?.user?.name?.[0] ?? '?'}</span>
                    </div>
                    <p className="font-bold text-text-primary text-xs md:text-sm truncate">{entry.student?.user?.name ?? '-'}</p>
                    <p className={`text-primary font-extrabold tabular-nums ${isFirst ? 'text-base md:text-lg' : 'text-sm md:text-lg'} mt-0.5 md:mt-1`}>
                      {Math.floor(minutes / 60)}h {minutes % 60}m
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full leaderboard */}
          <div className="bg-white rounded-2xl overflow-hidden border border-card-border card-shadow">
            {items.map((entry, idx) => {
              const style = rankStyle(entry.rankNo);
              const minutes = Math.round(Number(entry.score));
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 hover:bg-bg/50 transition-colors press-scale ${
                    idx !== items.length - 1 ? 'border-b border-divider/50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                    <span className={`text-sm font-extrabold tabular-nums ${style.color}`}>{entry.rankNo}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-primary">{entry.student?.user?.name?.[0] ?? '?'}</span>
                  </div>
                  <span className="flex-1 font-semibold text-text-primary text-sm truncate">{entry.student?.user?.name ?? '-'}</span>
                  <span className="tabular-nums font-bold text-primary text-sm shrink-0">
                    {Math.floor(minutes / 60)}h {minutes % 60}m
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Award Modal */}
      {showAward && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAward(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center animate-fade-in relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAward(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-bg flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-warm-light flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-gold" />
            </div>
            <p className="text-xs font-bold text-text-tertiary mb-1 tracking-wide uppercase">
              {periodLabel[period]} 1위
            </p>
            {top1 && (
              <>
                <p className="text-2xl font-extrabold text-text-primary mb-1">{top1.student?.user?.name ?? '-'}</p>
                <p className="text-sm text-text-tertiary mb-6 tabular-nums">
                  총 {Math.floor(Number(top1.score) / 60)}시간 {Math.round(Number(top1.score)) % 60}분
                </p>
              </>
            )}
            <button
              onClick={() => { alert('시상 처리 완료!'); setShowAward(false); }}
              className="w-full h-12 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              시상하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

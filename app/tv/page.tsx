'use client';
import { useState, useEffect } from 'react';
import { getTvDisplaySettings, updateTvDisplaySettings } from '@/lib/api';
import type { ReactElement } from 'react';
import { Tv, Trophy, Armchair, MessageSquare, Clock, RefreshCw, Maximize2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type TvMode = 'RANKING' | 'SEAT_MAP' | 'MESSAGE' | 'CLOCK';

const modes: { key: TvMode; label: string; desc: string; icon: typeof Trophy }[] = [
  { key: 'RANKING', label: '랭킹', desc: '오늘의 공부 랭킹', icon: Trophy },
  { key: 'SEAT_MAP', label: '좌석 현황', desc: '실시간 좌석 배치도', icon: Armchair },
  { key: 'MESSAGE', label: '메시지', desc: '자유 메시지', icon: MessageSquare },
  { key: 'CLOCK', label: '시계', desc: '현재 시각', icon: Clock },
];

export default function TvPage() {
  const [mode, setMode] = useState<TvMode>('RANKING');
  const [message, setMessage] = useState('열심히 공부합시다!');
  const [saving, setSaving] = useState(false);
  const [currentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    getTvDisplaySettings()
      .then((data: unknown) => {
        const d = data as Record<string, unknown>;
        if (d?.activeScreen) setMode(d.activeScreen as TvMode);
      })
      .catch(() => {});
  }, []);

  const handleModeChange = async (newMode: TvMode) => {
    setMode(newMode);
    setSaving(true);
    try {
      await updateTvDisplaySettings({ activeScreen: newMode });
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const previewContent: Record<TvMode, ReactElement> = {
    RANKING: (
      <div className="text-center">
        <p className="text-yellow-400 text-[10px] font-bold mb-5 tracking-[0.2em] uppercase">오늘의 랭킹</p>
        <p className="text-white/40 text-sm">실제 랭킹 데이터가 표시됩니다</p>
      </div>
    ),
    SEAT_MAP: (
      <div className="text-center">
        <p className="text-yellow-400 text-[10px] font-bold mb-5 tracking-[0.2em] uppercase">좌석 현황</p>
        <p className="text-white/40 text-sm">실시간 좌석 배치가 표시됩니다</p>
      </div>
    ),
    MESSAGE: (
      <div className="text-center px-6">
        <p className="text-white text-2xl font-bold leading-relaxed">{message || '메시지를 입력하세요'}</p>
      </div>
    ),
    CLOCK: (
      <div className="text-center">
        <p className="text-white text-5xl font-extrabold tabular-nums tracking-tight">{currentTime}</p>
        <p className="text-white/30 text-sm mt-3 font-medium">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>
    ),
  };

  const currentModeObj = modes.find(m => m.key === mode)!;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="TV 제어" description="학원 TV 화면을 관리합니다" icon={Tv} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
            <p className="text-[11px] font-bold text-text-tertiary mb-4 tracking-wide uppercase">표시 모드</p>
            <div className="grid grid-cols-2 gap-2.5">
              {modes.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.key}
                    onClick={() => handleModeChange(m.key)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      mode === m.key
                        ? 'bg-primary-surface border-primary/20'
                        : 'bg-bg border-transparent hover:border-card-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className={mode === m.key ? 'text-primary' : 'text-text-tertiary'} />
                      <p className={`font-semibold text-sm ${mode === m.key ? 'text-primary' : 'text-text-primary'}`}>
                        {m.label}
                      </p>
                    </div>
                    <p className="text-[11px] text-text-tertiary">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'MESSAGE' && (
            <div className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
              <p className="text-[11px] font-bold text-text-tertiary mb-3 tracking-wide uppercase">메시지 내용</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="TV에 표시할 메시지를 입력하세요"
                rows={3}
                className="w-full rounded-xl bg-bg border border-card-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-text-tertiary resize-none"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-card-border card-shadow">
            <p className="text-[11px] font-bold text-text-tertiary mb-3 tracking-wide uppercase">제어</p>
            <div className="flex gap-2">
              <button
                onClick={() => alert('화면을 새로고침했습니다.')}
                className="flex-1 h-10 bg-bg text-text-secondary rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 border border-card-border"
              >
                <RefreshCw size={14} />
                새로고침
              </button>
              <button
                onClick={() => alert('전체화면 모드로 전환합니다.')}
                className="flex-1 h-10 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Maximize2 size={14} />
                전체화면
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
            <p className="text-[11px] font-bold text-text-tertiary tracking-wide uppercase">
              미리보기 — {currentModeObj.label}
            </p>
            {saving && <span className="text-[10px] text-text-tertiary ml-auto">저장 중...</span>}
          </div>
          <div className="bg-gray-950 rounded-2xl overflow-hidden aspect-video flex items-center justify-center p-8 border border-gray-800">
            {previewContent[mode]}
          </div>
          <p className="text-[11px] text-text-tertiary mt-2.5 text-center font-medium">실제 TV 화면과 동일하게 표시됩니다</p>
        </div>
      </div>
    </div>
  );
}

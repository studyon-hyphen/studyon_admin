'use client';
import { useState, useEffect } from 'react';
import { getNotifications, createNotification, sendNotification } from '@/lib/api';
import type { NotificationResponse } from '@/lib/api';
import { Bell, Plus, X, Megaphone, Send } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
  DRAFT: { text: '임시저장', color: 'text-text-tertiary', bg: 'bg-bg' },
  SENT: { text: '발송됨', color: 'text-accent', bg: 'bg-accent-light' },
  SCHEDULED: { text: '예약', color: 'text-warm', bg: 'bg-warm-light' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    getNotifications().then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSending(true);
    try {
      const notif = await createNotification({ title, body });
      await sendNotification(notif.id);
      setTitle('');
      setBody('');
      setShowCompose(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : '발송에 실패했습니다.');
    }
    setSending(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto pb-24">
      <PageHeader
        title="알림"
        icon={Bell}
        description={`총 ${notifications.length}개`}
        actions={
          <button
            onClick={() => setShowCompose(true)}
            className="h-10 px-4 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} />
            공지 작성
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-card-border card-shadow text-center">
          <Bell size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-tertiary text-sm">알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const st = statusLabel[notif.status] ?? statusLabel.DRAFT;
            return (
              <div
                key={notif.id}
                className="bg-white rounded-2xl px-5 py-4 border border-card-border hover:border-gray-200 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-surface flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-text-primary truncate">{notif.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${st.bg} ${st.color}`}>{st.text}</span>
                        <span className="text-[11px] text-text-tertiary tabular-nums font-medium">{formatTime(notif.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed truncate">{notif.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCompose(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-surface flex items-center justify-center">
                  <Megaphone size={16} className="text-primary" />
                </div>
                <h3 className="text-base font-bold text-text-primary">공지 작성</h3>
              </div>
              <button
                onClick={() => setShowCompose(false)}
                className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors rounded-xl hover:bg-bg"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="공지 제목을 입력하세요"
                  className="w-full rounded-xl bg-bg border border-card-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-text-tertiary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">내용</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="공지 내용을 입력하세요"
                  rows={4}
                  className="w-full rounded-xl bg-bg border border-card-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-text-tertiary resize-none"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={sending || !title.trim()}
                className="w-full h-12 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    발송하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

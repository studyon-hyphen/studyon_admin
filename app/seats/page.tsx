'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSeats, getStudents, createSeat, assignSeat, lockSeat, unlockSeat, deleteSeat } from '@/lib/api';
import type { SeatResponse, StudentResponse } from '@/lib/api';
import { Armchair, Plus, Lock, Unlock, UserPlus, Trash2, X, Search, Info } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const statusStyle: Record<string, string> = {
  OCCUPIED: 'bg-primary-surface border-primary/20 ring-1 ring-primary/10',
  RESERVED: 'bg-warm-light border-warm/20 ring-1 ring-warm/10',
  AVAILABLE: 'bg-bg border-gray-200 border-dashed',
  LOCKED: 'bg-hot-light border-hot/20 ring-1 ring-hot/10',
};

const statusDot: Record<string, string> = {
  OCCUPIED: 'bg-primary',
  RESERVED: 'bg-warm',
  AVAILABLE: 'bg-gray-300',
  LOCKED: 'bg-hot',
};

const statusLabel: Record<string, string> = {
  OCCUPIED: '사용중',
  RESERVED: '예약',
  AVAILABLE: '빈자리',
  LOCKED: '잠금',
};

type ModalType = 'create' | 'assign' | 'detail' | null;

export default function SeatsPage() {
  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedSeat, setSelectedSeat] = useState<SeatResponse | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Create seat state
  const [newSeatNo, setNewSeatNo] = useState('');
  const [newZone, setNewZone] = useState('');
  const [bulkCount, setBulkCount] = useState(1);

  // Assign state
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSeats = useCallback(() => {
    getSeats(zoneFilter || undefined)
      .then(setSeats)
      .catch(() => setSeats([]))
      .finally(() => setLoading(false));
  }, [zoneFilter]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  useEffect(() => {
    if (!loading && seats.length <= 1) setShowGuide(true);
  }, [loading, seats.length]);

  const zones = [...new Set(seats.map(s => s.zone).filter(Boolean))].sort();
  const occupied = seats.filter(s => s.status === 'OCCUPIED').length;
  const available = seats.filter(s => s.status === 'AVAILABLE').length;
  const locked = seats.filter(s => s.status === 'LOCKED').length;
  const total = seats.length;

  const openCreate = () => {
    setNewSeatNo('');
    setNewZone('');
    setBulkCount(1);
    setModal('create');
  };

  const handleCreate = async () => {
    if (!newSeatNo.trim()) return;
    setSubmitting(true);
    try {
      if (bulkCount > 1) {
        const prefix = newZone.trim() || '';
        const startNum = parseInt(newSeatNo.trim()) || 1;
        for (let i = 0; i < bulkCount; i++) {
          const no = prefix ? `${prefix}-${String(startNum + i).padStart(2, '0')}` : String(startNum + i);
          await createSeat(no, newZone.trim() || undefined);
        }
      } else {
        await createSeat(newSeatNo.trim(), newZone.trim() || undefined);
      }
      setModal(null);
      loadSeats();
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const openAssign = (seat: SeatResponse) => {
    setSelectedSeat(seat);
    setStudentSearch('');
    setModal('assign');
    getStudents().then(setStudents).catch(() => setStudents([]));
  };

  const handleAssign = async (studentId: string) => {
    if (!selectedSeat) return;
    setSubmitting(true);
    try {
      await assignSeat(selectedSeat.id, studentId, 'ADMIN_ASSIGNED');
      setModal(null);
      loadSeats();
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleLockToggle = async (seat: SeatResponse) => {
    try {
      if (seat.status === 'LOCKED') {
        await unlockSeat(seat.id);
      } else {
        await lockSeat(seat.id);
      }
      loadSeats();
    } catch { /* ignore */ }
  };

  const handleDelete = async (seat: SeatResponse) => {
    if (!confirm(`좌석 ${seat.seatNo}을(를) 삭제하시겠습니까?`)) return;
    try {
      await deleteSeat(seat.id);
      loadSeats();
    } catch { /* ignore */ }
  };

  const openDetail = (seat: SeatResponse) => {
    setSelectedSeat(seat);
    setModal('detail');
  };

  const filteredStudents = students.filter(s =>
    s.user.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.loginId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="좌석 관리"
        icon={Armchair}
        description={total > 0 ? `총 ${total}석` : '등록된 좌석이 없습니다'}
        badge={total > 0 ? `${occupied}명 착석` : undefined}
      />

      {/* Quick guide banner */}
      {showGuide && (
        <div className="mb-5 bg-primary-surface border border-primary/15 rounded-2xl p-4 relative">
          <button onClick={() => setShowGuide(false)} className="absolute top-3 right-3 text-primary/40 hover:text-primary">
            <X size={16} />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Info size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary mb-1">좌석 관리 시작하기</p>
              <ol className="text-xs text-text-secondary space-y-1 list-decimal list-inside">
                <li><strong>좌석 추가</strong> — 우측 상단 &quot;좌석 추가&quot; 버튼으로 좌석을 만드세요. 여러 개를 한번에 추가할 수 있습니다.</li>
                <li><strong>학생 배정</strong> — 좌석을 클릭한 후 &quot;학생 배정&quot;으로 학생을 앉힐 수 있습니다.</li>
                <li><strong>잠금</strong> — 사용하지 않을 좌석은 잠금 처리할 수 있습니다.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      {total > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { label: '사용중', value: occupied, color: 'text-primary', bg: 'bg-primary-surface' },
            { label: '빈자리', value: available, color: 'text-accent', bg: 'bg-accent-light' },
            { label: '잠금', value: locked, color: 'text-hot', bg: 'bg-hot-light' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-2.5 flex items-center gap-2`}>
              <span className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</span>
              <span className="text-xs text-text-secondary font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Zone filter */}
        {zones.length > 0 && (
          <div className="flex gap-1.5 bg-white rounded-xl border border-card-border p-1">
            <button
              onClick={() => setZoneFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !zoneFilter ? 'bg-primary text-white' : 'text-text-secondary hover:bg-bg'
              }`}
            >
              전체
            </button>
            {zones.map(z => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  zoneFilter === z ? 'bg-primary text-white' : 'text-text-secondary hover:bg-bg'
                }`}
              >
                {z}구역
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 ml-auto">
          {Object.entries(statusLabel).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${statusDot[key]}`} />
              <span className="text-[11px] text-text-secondary font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Add seat button */}
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={14} />
          좌석 추가
        </button>
      </div>

      {/* Seat grid */}
      {seats.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-card-border text-center">
          <div className="w-16 h-16 bg-primary-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Armchair size={28} className="text-primary" />
          </div>
          <p className="text-text-primary font-bold mb-1">아직 좌석이 없습니다</p>
          <p className="text-text-tertiary text-sm mb-5">좌석을 추가해서 학생들의 자리를 배정해보세요.</p>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            첫 좌석 추가하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-card-border">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {seats.map(seat => (
              <button
                key={seat.id}
                onClick={() => openDetail(seat)}
                className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-[1.04] active:scale-95 border-2 cursor-pointer group ${statusStyle[seat.status] ?? statusStyle.AVAILABLE}`}
              >
                {/* Status dot */}
                <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${statusDot[seat.status]}`} />

                {seat.status === 'LOCKED' && <Lock size={16} className="text-hot/60 mb-1" />}
                {seat.status !== 'LOCKED' && (
                  <Armchair size={16} className={`mb-1 ${seat.status === 'OCCUPIED' ? 'text-primary/60' : 'text-gray-300'}`} />
                )}

                <span className="text-sm font-bold tabular-nums text-text-primary">{seat.seatNo}</span>

                {seat.currentStudent ? (
                  <span className="text-[10px] font-medium text-text-secondary mt-0.5 truncate max-w-[90%]">
                    {seat.currentStudent.user.name}
                  </span>
                ) : seat.status === 'AVAILABLE' ? (
                  <span className="text-[10px] text-text-tertiary mt-0.5 group-hover:text-primary transition-colors">
                    클릭하여 배정
                  </span>
                ) : seat.status === 'LOCKED' ? (
                  <span className="text-[10px] text-hot/60 mt-0.5">잠금됨</span>
                ) : null}
              </button>
            ))}

            {/* Add seat placeholder */}
            <button
              onClick={openCreate}
              className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-text-tertiary hover:border-primary hover:text-primary transition-all hover:bg-primary-surface/30 cursor-pointer"
            >
              <Plus size={18} className="mb-0.5" />
              <span className="text-[10px] font-medium">추가</span>
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && selectedSeat && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedSeat.status === 'OCCUPIED' ? 'bg-primary-surface' :
                  selectedSeat.status === 'LOCKED' ? 'bg-hot-light' : 'bg-bg'
                }`}>
                  <Armchair size={18} className={
                    selectedSeat.status === 'OCCUPIED' ? 'text-primary' :
                    selectedSeat.status === 'LOCKED' ? 'text-hot' : 'text-text-tertiary'
                  } />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">좌석 {selectedSeat.seatNo}</h3>
                  <span className={`text-[11px] font-semibold ${
                    selectedSeat.status === 'OCCUPIED' ? 'text-primary' :
                    selectedSeat.status === 'LOCKED' ? 'text-hot' : 'text-text-tertiary'
                  }`}>{statusLabel[selectedSeat.status] ?? selectedSeat.status}</span>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="text-text-tertiary hover:text-text-primary"><X size={18} /></button>
            </div>

            <div className="bg-bg rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">구역</span>
                <span className="font-medium text-text-primary">{selectedSeat.zone || '-'}</span>
              </div>
              {selectedSeat.currentStudent && (
                <div className="flex justify-between">
                  <span className="text-text-tertiary">배정 학생</span>
                  <span className="font-medium text-text-primary">{selectedSeat.currentStudent.user.name}</span>
                </div>
              )}
            </div>

            <div className="border-t border-divider pt-4 space-y-2">
              {selectedSeat.status !== 'OCCUPIED' && (
                <button
                  onClick={() => { setModal(null); setTimeout(() => openAssign(selectedSeat), 150); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  <UserPlus size={15} />
                  학생 배정
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { handleLockToggle(selectedSeat); setModal(null); }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedSeat.status === 'LOCKED'
                      ? 'bg-accent-light text-accent hover:bg-accent/10'
                      : 'bg-warm-light text-warm hover:bg-warm/10'
                  }`}
                >
                  {selectedSeat.status === 'LOCKED' ? <><Unlock size={14} /> 잠금 해제</> : <><Lock size={14} /> 잠금</>}
                </button>
                <button
                  onClick={() => { handleDelete(selectedSeat); setModal(null); }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-hot-light text-hot rounded-xl text-xs font-semibold hover:bg-hot/10 transition-colors"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">좌석 추가</h3>
              <button onClick={() => setModal(null)} className="text-text-tertiary hover:text-text-primary"><X size={18} /></button>
            </div>

            <div className="bg-sky-light rounded-xl p-3 text-xs text-text-secondary">
              구역과 시작 번호를 입력하면 자동으로 이름이 생성됩니다. (예: A구역, 1번부터 → A-01, A-02...)
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">구역</label>
                <input
                  value={newZone}
                  onChange={e => setNewZone(e.target.value)}
                  placeholder="예: A"
                  className="w-full px-3 py-2.5 rounded-xl border border-card-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  {bulkCount > 1 ? '시작 번호' : '좌석 번호'}
                </label>
                <input
                  value={newSeatNo}
                  onChange={e => setNewSeatNo(e.target.value)}
                  placeholder={bulkCount > 1 ? '예: 1' : '예: A-01'}
                  className="w-full px-3 py-2.5 rounded-xl border border-card-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">개수</label>
                <div className="flex items-center gap-2">
                  {[1, 5, 10, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => setBulkCount(n)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        bulkCount === n
                          ? 'bg-primary text-white'
                          : 'bg-bg text-text-secondary hover:bg-gray-100'
                      }`}
                    >
                      {n}개
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {newSeatNo && bulkCount > 1 && newZone && (
                <div className="bg-bg rounded-xl p-3">
                  <p className="text-[11px] text-text-tertiary mb-1.5">미리보기</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: Math.min(bulkCount, 8) }, (_, i) => {
                      const num = (parseInt(newSeatNo) || 1) + i;
                      return (
                        <span key={i} className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-text-secondary border border-card-border">
                          {newZone}-{String(num).padStart(2, '0')}
                        </span>
                      );
                    })}
                    {bulkCount > 8 && <span className="px-2 py-1 text-xs text-text-tertiary">...외 {bulkCount - 8}개</span>}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={submitting || !newSeatNo.trim()}
              className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40"
            >
              {submitting ? '추가 중...' : `${bulkCount}개 좌석 추가`}
            </button>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modal === 'assign' && selectedSeat && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">좌석 {selectedSeat.seatNo} 배정</h3>
              <button onClick={() => setModal(null)} className="text-text-tertiary hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="이름 또는 아이디로 검색..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-card-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Search size={20} className="text-text-tertiary mx-auto mb-2" />
                  <p className="text-text-tertiary text-xs">검색 결과 없음</p>
                </div>
              ) : (
                filteredStudents.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleAssign(s.id)}
                    disabled={submitting}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-primary-surface/50 transition-colors text-left group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{s.user.name}</p>
                      <p className="text-[11px] text-text-tertiary">{s.loginId}</p>
                    </div>
                    <span className="text-[11px] text-text-tertiary">{s.grade?.name} {s.class?.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

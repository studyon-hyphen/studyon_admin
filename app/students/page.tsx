'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents, getGrades, getClasses, getSeats, createStudent } from '@/lib/api';
import type { StudentResponse, SeatResponse } from '@/lib/api';
import { Users, Search, Plus, ChevronRight, X, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Registration modal state
  const [showRegister, setShowRegister] = useState(false);
  const [grades, setGrades] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string; gradeId: string }>>([]);
  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [regName, setRegName] = useState('');
  const [regStudentNo, setRegStudentNo] = useState('');
  const [regGradeId, setRegGradeId] = useState('');
  const [regClassId, setRegClassId] = useState('');
  const [regSeatId, setRegSeatId] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const loadStudents = async (keyword?: string) => {
    setLoading(true);
    try {
      const data = await getStudents(keyword ? { keyword } : undefined);
      setStudents(data);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadStudents(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudents(search || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const openRegister = async () => {
    setShowRegister(true);
    setRegName('');
    setRegStudentNo('');
    setRegGradeId('');
    setRegClassId('');
    setRegSeatId('');
    setRegError('');
    try {
      const [g, c, s] = await Promise.all([
        getGrades().catch(() => []),
        getClasses().catch(() => []),
        getSeats().catch(() => []),
      ]);
      setGrades(g);
      setClasses(c);
      setSeats(s.filter(seat => seat.status === 'AVAILABLE'));
    } catch {
      // ignore
    }
  };

  const handleRegister = async () => {
    if (!regName.trim()) {
      setRegError('이름은 필수입니다.');
      return;
    }
    setRegError('');
    setRegLoading(true);
    try {
      const autoNo = `S${Date.now().toString().slice(-8)}`;
      await createStudent({
        name: regName.trim(),
        studentNo: regStudentNo.trim() || autoNo,
        gradeId: regGradeId || undefined,
        classId: regClassId || undefined,
        assignedSeatId: regSeatId || undefined,
      });
      setShowRegister(false);
      loadStudents();
    } catch (err) {
      setRegError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    }
    setRegLoading(false);
  };

  const filteredClasses = regGradeId
    ? classes.filter(c => c.gradeId === regGradeId)
    : classes;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="학생 관리"
        description={`등록된 학생 ${students.length}명`}
        icon={Users}
        actions={
          <button
            onClick={openRegister}
            className="h-10 px-4 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} />
            학생 추가
          </button>
        }
      />

      <div className="mb-5 relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          placeholder="이름, 학번으로 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl bg-bg border border-card-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-text-tertiary"
        />
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
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-text-tertiary tracking-wide uppercase">반</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-text-tertiary tracking-wide uppercase">상태</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr
                    key={student.id}
                    onClick={() => router.push(`/students/${student.id}`)}
                    className={`hover:bg-bg/50 transition-colors cursor-pointer group ${idx !== students.length - 1 ? 'border-b border-divider/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-surface flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{student.user.name[0]}</span>
                        </div>
                        <span className="font-semibold text-text-primary">{student.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{[student.grade?.name, student.class?.name].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.enrollmentStatus === 'ACTIVE'
                          ? 'bg-accent-light text-accent'
                          : 'bg-bg text-text-tertiary'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.enrollmentStatus === 'ACTIVE' ? 'bg-accent' : 'bg-text-tertiary'
                        }`} />
                        {student.enrollmentStatus === 'ACTIVE' ? '재학' : '비활성'}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <ChevronRight size={16} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="text-center py-16 text-text-tertiary text-sm">
                {search ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {students.map(student => (
              <div
                key={student.id}
                onClick={() => router.push(`/students/${student.id}`)}
                className="bg-white rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all border border-card-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-surface flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{student.user.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-text-primary">{student.user.name}</span>
                    <p className="text-[11px] text-text-tertiary">{[student.grade?.name, student.class?.name].filter(Boolean).join(' ') || '미배정'}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-tertiary" />
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="text-center py-16 text-text-tertiary text-sm">
                {search ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
              </div>
            )}
          </div>
        </>
      )}

      {/* Registration Modal */}
      {showRegister && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowRegister(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-surface flex items-center justify-center">
                  <UserPlus size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">학생 등록</h3>
                  <p className="text-[11px] text-text-tertiary">초기 비밀번호는 자동 생성됩니다</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegister(false)}
                className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors rounded-xl hover:bg-bg"
              >
                <X size={16} />
              </button>
            </div>

            {regError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-hot-light border border-hot/15 text-hot text-sm font-medium">
                {regError}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">이름 *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full rounded-xl bg-bg border border-card-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-text-tertiary"
                />
              </div>

              {/* Grade & Class */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">레벨</label>
                  <select
                    value={regGradeId}
                    onChange={e => { setRegGradeId(e.target.value); setRegClassId(''); }}
                    className="w-full rounded-xl bg-bg border border-card-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-text-primary"
                  >
                    <option value="">선택 안함</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">반</label>
                  <select
                    value={regClassId}
                    onChange={e => setRegClassId(e.target.value)}
                    className="w-full rounded-xl bg-bg border border-card-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-text-primary"
                  >
                    <option value="">선택 안함</option>
                    {filteredClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seat */}
              <div>
                <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">좌석 배정</label>
                <select
                  value={regSeatId}
                  onChange={e => setRegSeatId(e.target.value)}
                  className="w-full rounded-xl bg-bg border border-card-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-text-primary"
                >
                  <option value="">배정 안함</option>
                  {seats.map(s => (
                    <option key={s.id} value={s.id}>{s.seatNo} ({s.zone}구역)</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                onClick={handleRegister}
                disabled={regLoading || !regName.trim() || !regStudentNo.trim()}
                className="w-full h-12 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {regLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    학생 등록
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

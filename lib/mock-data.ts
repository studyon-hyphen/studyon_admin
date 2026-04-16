import type {
  Student,
  Seat,
  Attendance,
  RankingItem,
  AppNotification,
  DashboardData,
} from './types';

// ─── Students ───────────────────────────────────────────────────────────────

const STUDENTS: Student[] = [
  {
    id: 's1',
    studentNo: '20240101',
    name: '김민준',
    grade: '1',
    className: '1반',
    seatNo: 'A1',
    status: 'studying',
    todayMinutes: 320,
    weeklyMinutes: 1540,
    streak: 12,
    phone: '010-1234-5678',
  },
  {
    id: 's2',
    studentNo: '20240102',
    name: '이서연',
    grade: '1',
    className: '2반',
    seatNo: 'A2',
    status: 'studying',
    todayMinutes: 285,
    weeklyMinutes: 1320,
    streak: 8,
    phone: '010-2345-6789',
  },
  {
    id: 's3',
    studentNo: '20240201',
    name: '박도윤',
    grade: '2',
    className: '1반',
    seatNo: 'B1',
    status: 'onBreak',
    todayMinutes: 190,
    weeklyMinutes: 980,
    streak: 5,
    phone: '010-3456-7890',
  },
  {
    id: 's4',
    studentNo: '20240202',
    name: '최지아',
    grade: '2',
    className: '3반',
    seatNo: 'B3',
    status: 'studying',
    todayMinutes: 410,
    weeklyMinutes: 1890,
    streak: 21,
    phone: '010-4567-8901',
  },
  {
    id: 's5',
    studentNo: '20240301',
    name: '정하은',
    grade: '3',
    className: '2반',
    seatNo: 'C2',
    status: 'studying',
    todayMinutes: 360,
    weeklyMinutes: 1720,
    streak: 15,
    phone: '010-5678-9012',
  },
  {
    id: 's6',
    studentNo: '20240302',
    name: '강준서',
    grade: '3',
    className: '1반',
    seatNo: 'C4',
    status: 'notCheckedIn',
    todayMinutes: 0,
    weeklyMinutes: 620,
    streak: 0,
    phone: '010-6789-0123',
  },
  {
    id: 's7',
    studentNo: '20240303',
    name: '윤시우',
    grade: '3',
    className: '3반',
    seatNo: 'D1',
    status: 'checkedOut',
    todayMinutes: 240,
    weeklyMinutes: 1100,
    streak: 3,
    phone: '010-7890-1234',
  },
  {
    id: 's8',
    studentNo: '20240103',
    name: '오지호',
    grade: '1',
    className: '3반',
    seatNo: 'A4',
    status: 'studying',
    todayMinutes: 275,
    weeklyMinutes: 1250,
    streak: 7,
    phone: '010-8901-2345',
  },
  {
    id: 's9',
    studentNo: '20240203',
    name: '송아린',
    grade: '2',
    className: '2반',
    seatNo: 'B4',
    status: 'onBreak',
    todayMinutes: 150,
    weeklyMinutes: 780,
    streak: 4,
    phone: '010-9012-3456',
  },
  {
    id: 's10',
    studentNo: '20240304',
    name: '임채원',
    grade: '3',
    className: '2반',
    seatNo: 'D3',
    status: 'studying',
    todayMinutes: 390,
    weeklyMinutes: 1650,
    streak: 18,
    phone: '010-0123-4567',
  },
];

// ─── Seats (A1-D4, 4 zones × 4 seats = 16; add C1,C3,D2,D4,A3,B2 = 22 total) ──

const SEATS: Seat[] = [
  // Zone A
  { id: 'seat-A1', seatNo: 'A1', zone: 'A', status: 'studying', studentName: '김민준', studentId: 's1' },
  { id: 'seat-A2', seatNo: 'A2', zone: 'A', status: 'studying', studentName: '이서연', studentId: 's2' },
  { id: 'seat-A3', seatNo: 'A3', zone: 'A', status: 'empty' },
  { id: 'seat-A4', seatNo: 'A4', zone: 'A', status: 'studying', studentName: '오지호', studentId: 's8' },
  { id: 'seat-A5', seatNo: 'A5', zone: 'A', status: 'empty' },
  { id: 'seat-A6', seatNo: 'A6', zone: 'A', status: 'empty' },
  // Zone B
  { id: 'seat-B1', seatNo: 'B1', zone: 'B', status: 'onBreak', studentName: '박도윤', studentId: 's3' },
  { id: 'seat-B2', seatNo: 'B2', zone: 'B', status: 'empty' },
  { id: 'seat-B3', seatNo: 'B3', zone: 'B', status: 'studying', studentName: '최지아', studentId: 's4' },
  { id: 'seat-B4', seatNo: 'B4', zone: 'B', status: 'onBreak', studentName: '송아린', studentId: 's9' },
  { id: 'seat-B5', seatNo: 'B5', zone: 'B', status: 'empty' },
  { id: 'seat-B6', seatNo: 'B6', zone: 'B', status: 'empty' },
  // Zone C
  { id: 'seat-C1', seatNo: 'C1', zone: 'C', status: 'empty' },
  { id: 'seat-C2', seatNo: 'C2', zone: 'C', status: 'studying', studentName: '정하은', studentId: 's5' },
  { id: 'seat-C3', seatNo: 'C3', zone: 'C', status: 'empty' },
  { id: 'seat-C4', seatNo: 'C4', zone: 'C', status: 'notCheckedIn', studentName: '강준서', studentId: 's6' },
  // Zone D
  { id: 'seat-D1', seatNo: 'D1', zone: 'D', status: 'empty' },
  { id: 'seat-D2', seatNo: 'D2', zone: 'D', status: 'empty' },
  { id: 'seat-D3', seatNo: 'D3', zone: 'D', status: 'studying', studentName: '임채원', studentId: 's10' },
  { id: 'seat-D4', seatNo: 'D4', zone: 'D', status: 'empty' },
  { id: 'seat-D5', seatNo: 'D5', zone: 'D', status: 'empty' },
  { id: 'seat-D6', seatNo: 'D6', zone: 'D', status: 'empty' },
];

// ─── Attendance (7 days) ─────────────────────────────────────────────────────

function generateAttendance(): Attendance[] {
  const records: Attendance[] = [];
  const today = new Date('2026-04-14');

  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    STUDENTS.forEach((student, idx) => {
      const isAbsent = d === 2 && idx >= 7; // some absences mid-week
      if (isAbsent) {
        records.push({
          id: `att-${student.id}-${dateStr}`,
          studentId: student.id,
          studentName: student.name,
          date: dateStr,
          stayMinutes: 0,
          status: 'absent',
        });
        return;
      }

      const checkInHour = 8 + (idx % 3);
      const checkInMin = (idx * 7) % 60;
      const isLate = checkInHour >= 9;
      const stayMinutes = 180 + (idx * 30) % 240;
      const checkInStr = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`;
      const checkOutDate = new Date(date);
      const totalMins = checkInHour * 60 + checkInMin + stayMinutes;
      const checkOutHour = Math.floor(totalMins / 60);
      const checkOutMin = totalMins % 60;
      const checkOutStr = d === 0 && student.status !== 'checkedOut'
        ? undefined
        : `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`;

      records.push({
        id: `att-${student.id}-${dateStr}`,
        studentId: student.id,
        studentName: student.name,
        date: dateStr,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        stayMinutes: checkOutStr ? stayMinutes : Math.floor(stayMinutes * 0.6),
        status: isLate ? 'late' : 'present',
      });
    });
  }

  return records;
}

const ATTENDANCE = generateAttendance();

// ─── Rankings ────────────────────────────────────────────────────────────────

const RANKINGS_WEEKLY: RankingItem[] = [
  { rank: 1, studentId: 's4', studentName: '최지아', minutes: 1890, trend: 2 },
  { rank: 2, studentId: 's5', studentName: '정하은', minutes: 1720, trend: 0 },
  { rank: 3, studentId: 's10', studentName: '임채원', minutes: 1650, trend: 1 },
  { rank: 4, studentId: 's1', studentName: '김민준', minutes: 1540, trend: -1 },
  { rank: 5, studentId: 's2', studentName: '이서연', minutes: 1320, trend: 3 },
  { rank: 6, studentId: 's8', studentName: '오지호', minutes: 1250, trend: -2 },
  { rank: 7, studentId: 's7', studentName: '윤시우', minutes: 1100, trend: 0 },
  { rank: 8, studentId: 's3', studentName: '박도윤', minutes: 980, trend: 1 },
  { rank: 9, studentId: 's9', studentName: '송아린', minutes: 780, trend: -1 },
  { rank: 10, studentId: 's6', studentName: '강준서', minutes: 620, trend: -3 },
];

const RANKINGS_MONTHLY: RankingItem[] = RANKINGS_WEEKLY.map((r) => ({
  ...r,
  minutes: r.minutes * 4 - Math.floor(Math.random() * 200),
  trend: r.trend * -1,
}));

const RANKINGS_DAILY: RankingItem[] = [
  { rank: 1, studentId: 's4', studentName: '최지아', minutes: 410, trend: 1 },
  { rank: 2, studentId: 's10', studentName: '임채원', minutes: 390, trend: 2 },
  { rank: 3, studentId: 's5', studentName: '정하은', minutes: 360, trend: 0 },
  { rank: 4, studentId: 's1', studentName: '김민준', minutes: 320, trend: -1 },
  { rank: 5, studentId: 's2', studentName: '이서연', minutes: 285, trend: 1 },
  { rank: 6, studentId: 's8', studentName: '오지호', minutes: 275, trend: 0 },
  { rank: 7, studentId: 's7', studentName: '윤시우', minutes: 240, trend: -2 },
  { rank: 8, studentId: 's3', studentName: '박도윤', minutes: 190, trend: 1 },
  { rank: 9, studentId: 's9', studentName: '송아린', minutes: 150, trend: -1 },
  { rank: 10, studentId: 's6', studentName: '강준서', minutes: 0, trend: -3 },
];

// ─── Notifications ───────────────────────────────────────────────────────────

const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: '공지사항',
    body: '4월 15일(수) 정기 청소로 인해 오전 8시~9시 자습실 이용이 제한됩니다.',
    type: 'announcement',
    createdAt: '2026-04-14T09:00:00',
    isRead: false,
  },
  {
    id: 'n2',
    title: '출석 알림',
    body: '강준서 학생이 오늘 아직 입실하지 않았습니다.',
    type: 'attendance',
    createdAt: '2026-04-14T10:30:00',
    isRead: false,
  },
  {
    id: 'n3',
    title: '지각 알림',
    body: '박도윤 학생이 오늘 09:14에 지각 입실하였습니다.',
    type: 'late',
    createdAt: '2026-04-14T09:14:00',
    isRead: true,
  },
  {
    id: 'n4',
    title: '퇴실 알림',
    body: '윤시우 학생이 15:20에 퇴실하였습니다. (총 240분)',
    type: 'checkout',
    createdAt: '2026-04-14T15:20:00',
    isRead: true,
  },
  {
    id: 'n5',
    title: '목표 달성',
    body: '최지아 학생이 이번 주 목표 30시간을 달성했습니다! 🎉',
    type: 'goal',
    createdAt: '2026-04-14T14:00:00',
    isRead: false,
  },
  {
    id: 'n6',
    title: '공지사항',
    body: '4월 시험 기간 특별 운영: 평일 오전 7시 ~ 오후 11시, 주말 오전 8시 ~ 오후 10시.',
    type: 'announcement',
    createdAt: '2026-04-13T18:00:00',
    isRead: true,
  },
  {
    id: 'n7',
    title: '목표 달성',
    body: '임채원 학생이 연속 출석 18일을 달성했습니다!',
    type: 'goal',
    createdAt: '2026-04-13T17:00:00',
    isRead: true,
  },
];

// ─── Exported functions ───────────────────────────────────────────────────────

export function getDashboard(): DashboardData {
  const checkedIn = SEATS.filter((s) => s.status === 'studying' || s.status === 'onBreak').length;
  const emptySeats = SEATS.filter((s) => s.status === 'empty').length;
  const studyingStudents = STUDENTS.filter((s) => s.status === 'studying' || s.status === 'onBreak');
  const totalStudyMinutes = studyingStudents.reduce((acc, s) => acc + s.todayMinutes, 0);
  const avgStudyMinutes = studyingStudents.length > 0
    ? Math.round(totalStudyMinutes / studyingStudents.length)
    : 0;

  return {
    checkedIn,
    totalSeats: SEATS.length,
    emptySeats,
    totalStudyMinutes,
    avgStudyMinutes,
    seats: SEATS,
    topRankings: RANKINGS_WEEKLY.slice(0, 5),
    hourlyStats: { 9: 2, 10: 8, 11: 12, 12: 10, 13: 14, 14: 16, 15: 15, 16: 17, 17: 18, 18: 18, 19: 16, 20: 14, 21: 10, 22: 4 },
  };
}

export function getStudents(): Student[] {
  return STUDENTS;
}

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

export function getSeats(): Seat[] {
  return SEATS;
}

export function getAttendance(date: string): Attendance[] {
  return ATTENDANCE.filter((a) => a.date === date);
}

export function getRankings(period: 'daily' | 'weekly' | 'monthly'): RankingItem[] {
  switch (period) {
    case 'daily':
      return RANKINGS_DAILY;
    case 'monthly':
      return RANKINGS_MONTHLY;
    case 'weekly':
    default:
      return RANKINGS_WEEKLY;
  }
}

export function getNotifications(): AppNotification[] {
  return NOTIFICATIONS;
}

export function getAnalytics(period: string, className: string): import('./types').AnalyticsData {
  return {
    totalHours: period === 'month' ? 258 : period === 'semester' ? 1240 : 43,
    avgHours: period === 'month' ? 12.9 : period === 'semester' ? 62 : 2.3,
    attendanceRate: 87,
    activeStudents: 42,
    dailyHours: [
      { day: '월', hours: 5.2 },
      { day: '화', hours: 7.1 },
      { day: '수', hours: 4.8 },
      { day: '목', hours: 6.5 },
      { day: '금', hours: 5.9 },
      { day: '토', hours: 8.2 },
      { day: '일', hours: 3.1 },
    ],
    subjectDistribution: [
      { subject: '수학', hours: 18, color: '#6C5CE7' },
      { subject: '영어', hours: 12, color: '#00B894' },
      { subject: '과학', hours: 8, color: '#FDCB6E' },
      { subject: '국어', hours: 5, color: '#E17055' },
    ],
  };
}

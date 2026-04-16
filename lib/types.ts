export interface Student {
  id: string;
  studentNo: string;
  name: string;
  grade: string;
  className: string;
  seatNo: string;
  status: 'studying' | 'onBreak' | 'notCheckedIn' | 'checkedOut';
  todayMinutes: number;
  weeklyMinutes: number;
  streak: number;
  phone?: string;
}

export interface Seat {
  id: string;
  seatNo: string;
  zone: string;
  status: 'studying' | 'onBreak' | 'empty' | 'notCheckedIn';
  studentName?: string;
  studentId?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  stayMinutes: number;
  status: 'present' | 'late' | 'absent';
}

export interface RankingItem {
  rank: number;
  studentId: string;
  studentName: string;
  minutes: number;
  trend: number; // positive = up, negative = down
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'announcement' | 'attendance' | 'late' | 'checkout' | 'goal';
  createdAt: string;
  isRead: boolean;
}

export interface DashboardData {
  checkedIn: number;
  totalSeats: number;
  emptySeats: number;
  totalStudyMinutes: number;
  avgStudyMinutes: number;
  seats: Seat[];
  topRankings: RankingItem[];
  hourlyStats: Record<number, number>;
}

export interface AnalyticsData {
  totalHours: number;
  avgHours: number;
  attendanceRate: number;
  activeStudents: number;
  dailyHours: { day: string; hours: number }[];
  subjectDistribution: { subject: string; hours: number; color: string }[];
}

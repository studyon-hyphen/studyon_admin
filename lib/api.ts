const API_BASE = '/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: Record<string, unknown>;
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
    if (json.success) {
      setTokens(json.data.accessToken, json.data.refreshToken);
      return json.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401, try refresh
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// ─── Auth ─────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
}

export async function signup(name: string, email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/admin/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || '회원가입에 실패했습니다.');
  }
  const json: ApiResponse<LoginResponse> = await res.json();
  setTokens(json.data.accessToken, json.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(json.data.user));
  return json.data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || '로그인에 실패했습니다.');
  }
  const json: ApiResponse<LoginResponse> = await res.json();
  setTokens(json.data.accessToken, json.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(json.data.user));
  return json.data;
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  }
  clearTokens();
}

export async function getMe() {
  return apiFetch<{
    id: string;
    role: string;
    name: string;
    adminUser?: { email: string };
  }>('/auth/me');
}

// ─── Dashboard ────────────────────────────────────────

export interface DashboardResponse {
  checkedInCount: number;
  seatOccupancyRate: number;
  availableSeatCount: number;
  notCheckedInStudents: number;
  notStartedStudyStudents: number;
  inactiveStudents: number;
}

export async function getDashboard() {
  return apiFetch<DashboardResponse>('/admin/dashboard');
}

// ─── Students ─────────────────────────────────────────

export interface StudentResponse {
  id: string;
  userId: string;
  studentNo: string;
  loginId: string;
  assignedSeatId: string | null;
  enrollmentStatus: string;
  memo: string | null;
  user: {
    id: string;
    name: string;
    status: string;
    phone: string | null;
  };
  grade: { id: string; name: string };
  class: { id: string; name: string };
  group: { id: string; name: string } | null;
  seat?: { seatNo: string } | null;
}

export async function getStudents(params?: { keyword?: string; gradeId?: string; classId?: string }) {
  const qs = new URLSearchParams();
  if (params?.keyword) qs.set('keyword', params.keyword);
  if (params?.gradeId) qs.set('gradeId', params.gradeId);
  if (params?.classId) qs.set('classId', params.classId);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<StudentResponse[]>(`/admin/students${query}`);
}

export async function getStudent(studentId: string) {
  return apiFetch<StudentResponse>(`/admin/students/${studentId}`);
}

export async function createStudent(data: {
  name: string;
  studentNo: string;
  gradeId?: string;
  classId?: string;
  groupId?: string;
  assignedSeatId?: string;
}) {
  return apiFetch<StudentResponse>('/admin/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getStudentStudySummary(studentId: string) {
  return apiFetch<{ metrics: Array<{ metricDate: string; studyMinutes: number; attendanceMinutes: number; attendanceStatus: string }> }>(
    `/admin/students/${studentId}/study-summary`
  );
}

// ─── Seats ────────────────────────────────────────────

export interface SeatResponse {
  id: string;
  seatNo: string;
  zone: string;
  status: string; // AVAILABLE, OCCUPIED, RESERVED, LOCKED
  isActive: boolean;
  currentStudentId: string | null;
  currentStudent: { id: string; user: { name: string } } | null;
}

export async function getSeats(zone?: string, status?: string) {
  const qs = new URLSearchParams();
  if (zone) qs.set('zone', zone);
  if (status) qs.set('status', status);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<SeatResponse[]>(`/admin/seats${query}`);
}

export async function createSeat(seatNo: string, zone?: string) {
  return apiFetch<SeatResponse>('/admin/seats', {
    method: 'POST',
    body: JSON.stringify({ seatNo, zone }),
  });
}

export async function updateSeat(seatId: string, status?: string, zone?: string) {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  if (zone) qs.set('zone', zone);
  return apiFetch<SeatResponse>(`/admin/seats/${seatId}?${qs}`, { method: 'PATCH' });
}

export async function assignSeat(seatId: string, studentId: string, assignmentType: string) {
  return apiFetch<SeatResponse>(`/admin/seats/${seatId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ studentId, assignmentType }),
  });
}

export async function lockSeat(seatId: string) {
  return apiFetch<SeatResponse>(`/admin/seats/${seatId}/lock`, { method: 'POST' });
}

export async function unlockSeat(seatId: string) {
  return apiFetch<SeatResponse>(`/admin/seats/${seatId}/unlock`, { method: 'POST' });
}

export async function deleteSeat(seatId: string) {
  return apiFetch<void>(`/admin/seats/${seatId}`, { method: 'DELETE' });
}

// ─── Attendances ──────────────────────────────────────

export interface AttendanceResponse {
  id: string;
  studentId: string;
  attendanceDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  stayMinutes: number;
  attendanceStatus: string;
  lateStatus: string;
  student: {
    id: string;
    user: { name: string };
    grade: { name: string };
    class: { name: string };
  };
  seat?: { seatNo: string } | null;
}

export async function getAttendances(params?: { date?: string; classId?: string; attendanceStatus?: string }) {
  const qs = new URLSearchParams();
  if (params?.date) qs.set('date', params.date);
  if (params?.classId) qs.set('classId', params.classId);
  if (params?.attendanceStatus) qs.set('attendanceStatus', params.attendanceStatus);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<AttendanceResponse[]>(`/admin/attendances${query}`);
}

export async function getAttendanceStats(params?: { startDate?: string; endDate?: string; classId?: string }) {
  const qs = new URLSearchParams();
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.classId) qs.set('classId', params.classId);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<unknown>(`/admin/attendance-stats${query}`);
}

// ─── Rankings ─────────────────────────────────────────

export interface RankingItemResponse {
  id: string;
  studentId: string;
  rankNo: number;
  score: string;
  subScore1: string;
  subScore2: string;
  student: {
    id: string;
    user: { name: string };
    grade: { name: string };
    class: { name: string };
  };
}

export interface RankingsResponse {
  snapshot: {
    id: string;
    rankingType: string;
    periodType: string;
    periodKey: string;
  };
  items: RankingItemResponse[];
}

export async function getRankings(periodType: string = 'DAILY', rankingType: string = 'STUDY_TIME') {
  return apiFetch<RankingsResponse>(`/admin/rankings?periodType=${periodType}&rankingType=${rankingType}`);
}

// ─── Notifications ────────────────────────────────────

export interface NotificationResponse {
  id: string;
  notificationType: string;
  channel: string;
  title: string;
  body: string;
  targetScope: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export async function getNotifications() {
  return apiFetch<NotificationResponse[]>('/admin/notifications');
}

export async function createNotification(data: { title: string; body: string; notificationType?: string; channel?: string; targetScope?: string }) {
  return apiFetch<NotificationResponse>('/admin/notifications', {
    method: 'POST',
    body: JSON.stringify({
      notificationType: 'ANNOUNCEMENT',
      channel: 'IN_APP',
      targetScope: 'ALL',
      ...data,
    }),
  });
}

export async function sendNotification(notificationId: string) {
  return apiFetch<unknown>(`/admin/notifications/${notificationId}/send`, { method: 'POST' });
}

// ─── Settings ─────────────────────────────────────────

export async function getTvDisplaySettings() {
  return apiFetch<unknown>('/admin/settings/tv-display');
}

export async function updateTvDisplaySettings(data: Record<string, unknown>) {
  return apiFetch<unknown>('/admin/settings/tv-display', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getAttendancePolicy() {
  return apiFetch<unknown>('/admin/settings/attendance-policy');
}

// ─── Study Overview (Analytics) ───────────────────────

export interface StudyMetric {
  id: string;
  studentId: string;
  metricDate: string;
  attendanceMinutes: number;
  studyMinutes: number;
  breakMinutes: number;
  targetMinutes: number;
  achievedRate: string;
  pagesCompleted: number;
  problemsSolved: number;
  studySessionCount: number;
  attendanceStatus: string;
  streakDays: number;
  student: {
    id: string;
    user: { name: string };
    grade: { name: string };
    class: { name: string };
  };
}

export interface AttendanceStatsResponse {
  total: number;
  checkedIn: number;
  attendanceRate: number;
  late: number;
  earlyLeave: number;
}

export interface DirectorOverviewResponse {
  attendanceRate: number;
  seatUtilizationRate: number;
  totalStudyMinutes: number;
  activeStudentCount: number;
}

export async function getStudyOverview(params?: { startDate?: string; endDate?: string; classId?: string }) {
  const qs = new URLSearchParams();
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.classId) qs.set('classId', params.classId);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<StudyMetric[]>(`/admin/study-overview${query}`);
}

export async function getAttendanceStatsApi(params?: { startDate?: string; endDate?: string; classId?: string }) {
  const qs = new URLSearchParams();
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.classId) qs.set('classId', params.classId);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<AttendanceStatsResponse>(`/admin/attendance-stats${query}`);
}

export async function getDirectorOverview() {
  return apiFetch<DirectorOverviewResponse>('/director/overview');
}

// ─── Grades / Classes ─────────────────────────────────

export async function getGrades() {
  return apiFetch<Array<{ id: string; name: string; sortOrder: number }>>('/admin/grades');
}

export async function getClasses() {
  return apiFetch<Array<{ id: string; name: string; gradeId: string; sortOrder: number }>>('/admin/classes');
}

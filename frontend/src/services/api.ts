import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

// Request interceptor: attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle auth errors
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  register: (data: any) => api.post('/api/auth/register', data),
  getProfile: () => api.get('/api/auth/profile'),
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/api/dashboard'),
  leaderboard: () => api.get('/api/dashboard/leaderboard'),
};

// ─── Aptitude ──────────────────────────────────────────────────────────────
export const aptitudeApi = {
  getQuestion: (params?: { module?: string; topic?: string; difficulty?: string }) =>
    api.get('/api/aptitude/question', { params }),
  submit: (data: { questionId: string; answer: string; timeTaken?: number }) =>
    api.post('/api/aptitude/submit', data),
  getTopics: (module: string) => api.get('/api/aptitude/topics', { params: { module } }),
};

// ─── Coding ────────────────────────────────────────────────────────────────
export const codingApi = {
  getQuestion: (params?: { difficulty?: string; topic?: string }) =>
    api.get('/api/coding/question', { params }),
  submit: (data: { questionId: string; code: string; language: string }) =>
    api.post('/api/coding/submit', data),
  review: (data: { code: string; language: string; problem: string }) =>
    api.post('/api/coding/review', data),
};

// ─── Interview ─────────────────────────────────────────────────────────────
export const interviewApi = {
  startTech: () => api.post('/api/interview/tech/start'),
  respondTech: (data: { question: string; answer: string; round: number }) =>
    api.post('/api/interview/tech/respond', data),
  startHR: (data?: { targetCompany?: string }) => api.post('/api/interview/hr/start', data || {}),
  respondHR: (data: { question: string; answer: string; round: number; finished?: boolean }) =>
    api.post('/api/interview/hr/respond', data),
  startGD: () => api.post('/api/interview/gd/start'),
  submitGD: (data: { topic: string; points: string[] }) => api.post('/api/interview/gd/submit', data),
  getHistory: (type?: string) => api.get('/api/interview/history', { params: type ? { type } : {} }),
};

// ─── Resume ────────────────────────────────────────────────────────────────
export const resumeApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/api/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getHistory: () => api.get('/api/resume/history'),
};

// ─── Advisor / Company ─────────────────────────────────────────────────────
export const advisorApi = {
  analyze: (data: any) => api.post('/api/advisor/analyze', data),
  getCompanies: () => api.get('/api/advisor/companies'),
  getCompany: (name: string) => api.get(`/api/advisor/companies/${name}`),
};

// ─── Tracker ───────────────────────────────────────────────────────────────
export const trackerApi = {
  getGoals: (date?: string) => api.get('/api/tracker', { params: date ? { date } : {} }),
  addGoal: (data: { title: string; targetDate?: string }) => api.post('/api/tracker', data),
  toggleGoal: (id: string) => api.patch(`/api/tracker/${id}/toggle`),
  deleteGoal: (id: string) => api.delete(`/api/tracker/${id}`),
};

export default api;

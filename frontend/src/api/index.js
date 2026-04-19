import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
  withCredentials: true,
});

// ─── Attach JWT automatically ─────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dac_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Global 401 handler ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dac_token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data ?? err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  googleLogin:   (data) => api.post('/auth/google', data),
  me:            ()     => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

// ─── LeetCode ─────────────────────────────────────────────────────────────────
export const leetcodeAPI = {
  sync:            ()    => api.post('/leetcode/sync'),
  getStats:        ()    => api.get('/leetcode/stats'),
  getStudentStats: (id)  => api.get(`/leetcode/stats/${id}`),
};

// ─── Sheets ───────────────────────────────────────────────────────────────────
export const sheetsAPI = {
  getMySheets:    ()              => api.get('/sheets/my'),
  getTeacherAll:  ()              => api.get('/sheets/teacher-all'),
  create:         (data)          => api.post('/sheets', data),
  update:         (id, data)      => api.put(`/sheets/${id}`, data),
  remove:         (id)            => api.delete(`/sheets/${id}`),
  toggleComplete: (sheetId, idx)  => api.post(`/sheets/${sheetId}/toggle/${idx}`),
  getMyProgress:  ()              => api.get('/sheets/progress/me'),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getClass:      () => api.get('/analytics/class'),
  getTopics:     () => api.get('/analytics/topics'),
  getLeaderboard:() => api.get('/analytics/leaderboard'),  // works for both roles
};

// ─── AI (proxied through backend to keep API key secret) ─────────────────────
export const aiAPI = {
  getInsight: (messages) =>
    api.post('/ai/insight', { messages, max_tokens: 1000 }),
};

export default api;
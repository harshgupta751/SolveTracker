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

// ─── Global error handler ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dac_token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:      (data)  => api.post('/auth/register', data),
  login:         (data)  => api.post('/auth/login', data),
  googleLogin:   (data)  => api.post('/auth/google', data),
  me:            ()      => api.get('/auth/me'),
  updateProfile: (data)  => api.patch('/auth/profile', data),
};

// ─── LeetCode ─────────────────────────────────────────────────────────────────
export const leetcodeAPI = {
  sync:       ()         => api.post('/leetcode/sync'),
  getStats:   ()         => api.get('/leetcode/stats'),
  getStudentStats: (id)  => api.get(`/leetcode/stats/${id}`),
};

// ─── Sheets ───────────────────────────────────────────────────────────────────
export const sheetsAPI = {
  getMySheets:    ()            => api.get('/sheets/my'),
  create:         (data)        => api.post('/sheets', data),
  update:         (id, data)    => api.put(`/sheets/${id}`, data),
  remove:         (id)          => api.delete(`/sheets/${id}`),
  markComplete:   (sheetId, idx)=> api.post(`/sheets/${sheetId}/complete/${idx}`),
};

// ─── Analytics (Teacher) ──────────────────────────────────────────────────────
export const analyticsAPI = {
  getClass:  () => api.get('/analytics/class'),
  getTopics: () => api.get('/analytics/topics'),
};

export default api;
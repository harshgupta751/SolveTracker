import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dac_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  googleLogin:   (data) => api.post('/auth/google', data),
  me:            ()     => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

export const leetcodeAPI = {
  sync:            ()   => api.post('/leetcode/sync'),
  getStats:        ()   => api.get('/leetcode/stats'),
  getStudentStats: (id) => api.get(`/leetcode/stats/${id}`),
  verifyProblem:   (titleSlug, sheetId, idx)    => api.post('/leetcode/verify-problem', { titleSlug, sheetId, problemIdx: idx }),
};

export const sheetsAPI = {
  // Teacher sheets
  getTeacherAll:  ()             => api.get('/sheets/teacher-all'),
  create:         (data)         => api.post('/sheets', data),
  update:         (id, data)     => api.put(`/sheets/${id}`, data),
  remove:         (id)           => api.delete(`/sheets/${id}`),
  // Student class sheets
  getMySheets:    ()             => api.get('/sheets/my'),
  // Student personal sheets
  getPersonal:    ()             => api.get('/sheets/personal'),
  createPersonal: (data)         => api.post('/sheets/personal', data),
  updatePersonal: (id, data)     => api.put(`/sheets/personal/${id}`, data),
  removePersonal: (id)           => api.delete(`/sheets/personal/${id}`),
  // Progress
  toggleComplete: (sid, idx)     => api.post(`/sheets/${sid}/toggle/${idx}`),
  getMyProgress:  ()             => api.get('/sheets/progress/me'),
};

export const analyticsAPI = {
  getClass:       () => api.get('/analytics/class'),
  getTopics:      () => api.get('/analytics/topics'),
  getLeaderboard: () => api.get('/analytics/leaderboard'),
};

// Teacher student management
export const studentsAPI = {
  getAll:         ()      => api.get('/students'),
  invite:         (email) => api.post('/students/invite', { email }),
  remove:         (id)    => api.delete(`/students/${id}`),
  cancelInvite:   (email) => api.delete(`/students/pending/${encodeURIComponent(email)}`),
};

export const aiAPI = {
  getInsight: (messages)                    => api.post('/ai/insight', { messages, max_tokens: 1000 }),
  chat:       (messages, userContext)       => api.post('/ai/chat', { messages, userContext }),
};

export default api;
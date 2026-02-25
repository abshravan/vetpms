import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request (if available)
// In demo mode, intercept and return mock data without hitting the backend
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof window !== 'undefined' && localStorage.getItem('demoMode') === 'true') {
    const { handleMockRequest } = await import('../demo/mock-api');
    const mockData = handleMockRequest(config.method || 'get', config.url || '');
    if (mockData !== undefined) {
      config.adapter = () =>
        Promise.resolve({
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        });
    }
  }

  return config;
});

// Handle 401 — attempt token refresh
// TODO: re-enable auth redirect when auth is turned back on
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // const originalRequest = error.config;
    //
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //
    //   try {
    //     const refreshToken = localStorage.getItem('refreshToken');
    //     if (!refreshToken) throw new Error('No refresh token');
    //
    //     const { data } = await axios.post('/api/auth/refresh', { refreshToken });
    //     localStorage.setItem('accessToken', data.accessToken);
    //     localStorage.setItem('refreshToken', data.refreshToken);
    //
    //     originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
    //     return api(originalRequest);
    //   } catch {
    //     localStorage.removeItem('accessToken');
    //     localStorage.removeItem('refreshToken');
    //     window.location.href = '/login';
    //   }
    // }

    return Promise.reject(error);
  },
);

export default api;

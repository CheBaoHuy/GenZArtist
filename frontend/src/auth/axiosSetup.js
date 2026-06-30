import axios from 'axios';
import { getToken, isTokenExpired, forceLogout } from './session';

// Đăng ký interceptor toàn cục cho axios (chỉ ảnh hưởng phía public — admin dùng fetch).
let installed = false;

const API_PREFIX = 'http://localhost:8080/api/v1';
// Endpoint công khai: không cần (và không nên) ép kiểm tra token.
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

const isPublic = (url = '') => PUBLIC_PATHS.some(p => url.includes(p));

export function setupAuthInterceptors() {
  if (installed) return;
  installed = true;

  // Request: tự gắn Bearer token; nếu token đã hết hạn thì đá session ngay,
  // không gửi request "chết" lên server.
  axios.interceptors.request.use((config) => {
    const url = config.url || '';
    if (isPublic(url)) return config;

    const token = getToken();
    if (token) {
      if (isTokenExpired(token)) {
        forceLogout({ reason: 'expired' });
        return Promise.reject(new axios.Cancel('Phiên đăng nhập đã hết hạn.'));
      }
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Response: server từ chối vì token sai/hết hạn -> đá session.
  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      if (axios.isCancel(error)) return Promise.reject(error);
      const status = error?.response?.status;
      const url = error?.config?.url || '';
      if ((status === 401 || status === 403) && url.startsWith(API_PREFIX) && !isPublic(url)) {
        forceLogout({ reason: 'expired' });
      }
      return Promise.reject(error);
    },
  );
}

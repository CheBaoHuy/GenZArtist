import { jwtDecode } from 'jwt-decode';

// Quản lý phiên đăng nhập phía client: đọc token, kiểm tra hết hạn, đá session.

const SKEW_SECONDS = 5; // trừ hao lệch giờ client/server

export function getToken() {
  return localStorage.getItem('token');
}

export function decodeToken(token = getToken()) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null; // token rác/không phải JWT
  }
}

// Token được coi là hết hạn nếu không decode được hoặc đã quá exp.
export function isTokenExpired(token = getToken()) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + SKEW_SECONDS;
}

export function isLoggedIn() {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
}

// Tránh đá/redirect nhiều lần liên tiếp (vd: nhiều request 401 cùng lúc).
let kicking = false;

// Không đá khi đang ở khu vực không liên quan tới phiên public.
function shouldRedirect() {
  const path = window.location.pathname;
  return !path.startsWith('/admin') && path !== '/login' && path !== '/register';
}

// Xoá phiên và đưa về trang login. Chỉ chạy khi thực sự từng có token.
export function forceLogout({ redirect = true, reason = 'expired' } = {}) {
  const hadToken = !!getToken();
  clearSession();
  if (!hadToken || kicking) return;
  if (redirect && shouldRedirect()) {
    kicking = true;
    window.location.replace(`/login?session=${reason}`);
  }
}

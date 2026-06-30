import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from './session';

// Chặn truy cập trực tiếp các trang cần đăng nhập. Token hết hạn cũng coi là chưa đăng nhập.
// Nếu truyền `role`, chỉ user đúng role mới vào được (tránh gọi nhầm endpoint -> 403 -> đá session).
export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ redirect: location.pathname + location.search }}
      />
    );
  }

  if (role && localStorage.getItem('role') !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

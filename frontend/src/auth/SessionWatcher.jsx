import { useEffect } from 'react';
import { getToken, isTokenExpired, forceLogout } from './session';

// Theo dõi phiên một cách bất đồng bộ: kể cả khi user ngồi yên không gọi API,
// hết hạn token vẫn bị đá ra. Đồng thời đồng bộ logout giữa nhiều tab.
const CHECK_INTERVAL_MS = 30_000;

export default function SessionWatcher() {
  useEffect(() => {
    const check = () => {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        forceLogout({ reason: 'expired' });
      }
    };

    check(); // kiểm tra ngay khi vào app
    const id = setInterval(check, CHECK_INTERVAL_MS);

    // Tab khác logout/đổi token -> tab này phản ứng theo.
    const onStorage = (e) => {
      if (e.key === 'token') check();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(id);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return null;
}

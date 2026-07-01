import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuth2Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get('token');
    const role = params.get('role');
    const fullName = params.get('fullName');

    if (token) {
      localStorage.setItem('token', token);

      if (role) localStorage.setItem('role', role);

      if (fullName) {
        localStorage.setItem('user', JSON.stringify({ fullName }));
      }

      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <p>Đang đăng nhập...</p>;
}

export default OAuth2Redirect;
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    
    if (token) {
      localStorage.setItem('token', token);

      // Xóa token khỏi URL
      navigate("/", { replace: true });
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  return <div>Đang hoàn tất đăng nhập...</div>;
};

export default AuthCallback;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { authService } from '../../auth/authService';

function Header() {
    const [user, setUser] = useState(authService.getUser());

    const logout = () => {
        authService.logout();
        setUser(null);
        window.location.reload();
    };
    
    console.log('User in Header:', user);
    return (
        <header class="header">
            <div class="logo">
                <Link to="/">GenZArtist</Link>
            </div>

            <input
                type="text"
                placeholder="Tìm kiếm nghệ sĩ..."
            />

            <div class="nav">
                {user ? (
                    <>
                        <Link to="/profile" class="nav-link">
                            <img src={user.avatarUrl || 'default-avatar.png'} alt="avatar" class="nav-avatar" />
                            <span>Chào, {user.fullName}</span>
                        </Link>
                        <button onClick={logout} class="nav-button">Đăng xuất</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" class="nav-button">Đăng nhập</Link>
                        <Link to="/register" class="nav-button primary">Đăng ký</Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;
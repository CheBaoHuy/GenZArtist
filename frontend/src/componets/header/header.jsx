import { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { UserProvider } from '../../context/UserProvider'; // Đường dẫn có thể cần điều chỉnh

function Header() {
    const { user, logout } = useContext(UserProvider);
    console.log('User in Header:', user); // Thêm dòng này để kiểm tra giá trị của user
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
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="logo">
                GenZArtist
            </div>

            <input
                type="text"
                placeholder="Search artists..."
            />

            <div className="nav">
                <button>Login</button>
                <button>Sign Up</button>
            </div>
        </header>
    );
}

export default Header;
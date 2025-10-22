import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../assets/navbar.css';
import '../assets/global.css'; // for theme variables

const Navbar = () => {
  const { name, logoutUser } = useContext(UserContext); // no need for role
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="nav-left">
        <div className="brand">
          <div className="title">Library Manager</div>
          <div className="sub">Smart Library System</div>
        </div>
      </div>

      {/* Links */}
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/books">Books</Link>
        <Link to="/checkinout">Issue/Return</Link>
        <Link to="/reservation">Reservation</Link>
        <Link to="/renew">Renew</Link>
      </div>

      {/* Right side */}
      <div className="nav-actions">
        <div className="toggle" onClick={() => setDark(d => !d)} title="Toggle Theme">
          {dark ? '🌙 Dark' : '☀️ Light'}
        </div>

        <div className="user-pill">
          <div style={{ fontWeight: 700 }}>{name || 'Guest'}</div>
          <button className="btn ghost" onClick={handleLogout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../assets/AdminNavbar.css';

const AdminNavbar = () => {
  const { name, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);

  const handleLogout = () => {
    logoutUser();
    navigate('/login/admin');
  };

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
    document.body.classList.toggle('light-theme', !darkTheme);
  };

  return (
    <header className="admin-navbar">
      <div className="nav-left">
        <Link to="/admin/dashboard" className="brand">Library Admin</Link>
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/books">Books</Link>
        <Link to="/admin/users">Students</Link>
        <Link to="/admin/transactions">Transactions</Link>
      </nav>

      <div className="nav-actions">
        <span>{name}</span>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={toggleTheme}>{darkTheme ? 'Light' : 'Dark'}</button>
      </div>
    </header>
  );
};

export default AdminNavbar;

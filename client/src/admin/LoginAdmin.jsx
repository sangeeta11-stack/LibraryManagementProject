import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../assets/global.css';
import '../assets/AdminLogin.css';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const LoginAdmin = () => {
  const { loginUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Send login request to backend
      const res = await axios.post('https://librarymanagementproject-69df.onrender.com/api/auth/login', {
        email,
        password,
        role: 'admin'
      });

      console.log('Login response:', res.data); // ✅ log response

      // Save in context & localStorage
      loginUser({
        token: res.data.token,
        userId: res.data.userId || res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role || 'admin',
      });

      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

      console.log('Redirecting to: /admin/dashboard');
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Login error:', err.response || err); // ✅ log error
      setMessage({ 
        text: err.response?.data?.message || 'Login failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back
        </button>
        <h2>Admin Login</h2>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <FaEnvelope className="icon-right" />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon-right" />
          </div>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;

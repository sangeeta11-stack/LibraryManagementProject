import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/login.css';
import '../assets/global.css';

const Login = () => {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: emailInput,
        password,
      });

      const payload = {
        token: res.data.token,
        userId: res.data.userId || res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role || "student",
      };

      loginUser(payload);
      alert('Login successful');

      const redirectPath = payload.role === "admin" ? "/admin" : "/dashboard";
      navigate(redirectPath);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              required
            />
            <i className="fa fa-envelope"></i>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <i className="fa fa-lock"></i>
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="login-footer">
          <p>New user? <Link to="/register">Register</Link></p>
          {/* Go to main page link */}
          <p><Link to="/" className="main-page-link">Go to Main Page</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

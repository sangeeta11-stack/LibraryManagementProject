import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/register.css';
import '../assets/global.css';

const Registration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://librarymanagementproject-69df.onrender.com/api/auth/register', {
        name, email, password, role: 'student'
      });

      alert('Registration Successful!');
      setName('');
      setEmail('');
      setPassword('');
      navigate('/'); // redirect to login after registration
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering user');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Student Registration</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <i className="fa fa-user"></i>
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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

          <button type="submit" className="register-btn">Register</button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Registration;

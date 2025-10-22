import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');
  const [name, setName] = useState(() => localStorage.getItem('name') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'student');

  // Login function
  const loginUser = ({ token, userId, name, email, role }) => {
    setToken(token);
    setUserId(userId);
    setName(name);
    setEmail(email);
    setRole(role);

    // Persist in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
  };

  // Logout function
  const logoutUser = () => {
    setToken('');
    setUserId('');
    setName('');
    setEmail('');
    setRole('student');

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  };

  return (
    <UserContext.Provider value={{ token, userId, name, email, role, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

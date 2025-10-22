import React, { useState } from 'react';
import axios from 'axios';
import '../assets/profile.css'
import '../assets/global.css'
const PasswordManagement = ({ token }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async () => {
    try {
      await axios.post('https://librarymanagementproject-69df.onrender.com/api/auth/change-password', 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing password');
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
      <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
      <button onClick={handleChangePassword}>Change Password</button>
    </div>
  );
};

export default PasswordManagement;

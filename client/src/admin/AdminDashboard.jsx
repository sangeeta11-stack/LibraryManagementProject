import React, { useContext, useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { token, name } = useContext(UserContext);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalUsers: 0,
    totalTransactions: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://librarymanagementproject-69df.onrender.com/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div>
      <AdminNavbar />
      <main style={{ padding: 20 }}>
        <h2>Welcome, {name}</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
            <h3>Total Books</h3>
            <p>{stats.totalBooks}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
            <h3>Available Books</h3>
            <p>{stats.availableBooks}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
            <h3>Total Transactions</h3>
            <p>{stats.totalTransactions}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useContext } from 'react';
import Navbar from './Navbar';
import { UserContext } from '../context/UserContext'; // <-- correct path
import '../assets/dashboard.css'
import '../assets/global.css'
const Dashboard = () => {
  const { name, role } = useContext(UserContext);

  return (
    <div>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <h2>{name}'s Dashboard</h2>
        {role === 'admin' ? (
          <div>
            <p>Admin Options:</p>
            <ul>
              <li>Manage Books</li>
              <li>Manage Transactions</li>
            </ul>
          </div>
        ) : (
          <div>
            <p>Student Options:</p>
            <ul>
              <li>View Books</li>
              <li>Issue / Return Books</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import '../assets/books.css';
import { UserContext } from '../context/UserContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const Transactions = () => {
  const { token } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ issued: 0, reserved: 0, renewed: 0 });

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/transactions/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = Array.isArray(res.data) ? res.data : res.data.transactions || [];
      setTransactions(data);

      // Summary counts
      const issued = data.filter(t => t.status === 'issued').length;
      const reserved = data.filter(t => t.status === 'reserved').length;
      const renewed = data.filter(t => t.status === 'renewed').length;
      setSummary({ issued, reserved, renewed });

    } catch (err) {
      console.error('Error fetching transactions:', err.response?.data || err.message);
      setTransactions([]);
      setSummary({ issued: 0, reserved: 0, renewed: 0 });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Prepare Bar Chart data (most transacted books)
  const bookCounts = {};
  transactions.forEach(t => {
    if (!t.book_title) return;
    if (!bookCounts[t.book_title]) bookCounts[t.book_title] = 0;
    bookCounts[t.book_title]++;
  });
  const bookChartData = Object.entries(bookCounts).map(([title, count]) => ({ title, count }));

  const pieData = [
    { name: 'Issued', value: summary.issued },
    { name: 'Reserved', value: summary.reserved },
    { name: 'Renewed', value: summary.renewed }
  ];

  return (
    <div className="transactions-container">
      <AdminNavbar />
      <main className="transactions-main" style={{ padding: '20px' }}>
        <h2>Library Transactions Dashboard</h2>

        {/* Summary Cards */}
        <div className="summary-cards" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
            <h3>Issued Books</h3>
            <p>{summary.issued}</p>
          </div>
          <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
            <h3>Reserved Books</h3>
            <p>{summary.reserved}</p>
          </div>
          <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', flex: 1 }}>
            <h3>Renewed Books</h3>
            <p>{summary.renewed}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
          {/* Pie Chart */}
          <div>
            <h4>Transaction Status Distribution</h4>
            <PieChart width={300} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {/* Bar Chart */}
          <div>
            <h4>Most Transacted Books</h4>
            <BarChart
              width={500}
              height={300}
              data={bookChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="table-wrapper">
          <h3>All Transactions</h3>
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No transactions found.</td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id || t.book_id + t.user_email}>
                    <td>{t.id || '-'}</td>
                    <td>{t.user_name || '-'}</td>
                    <td>{t.user_email || '-'}</td>
                    <td>{t.book_title || '-'}</td>
                    <td>{t.issue_date ? new Date(t.issue_date).toLocaleDateString() : '-'}</td>
                    <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</td>
                    <td>{t.status || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Transactions;

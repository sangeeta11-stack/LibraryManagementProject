// client/src/components/Reports.jsx
import React, { useEffect, useState, useContext } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import '../assets/transactions.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const { token, role } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booksReport, setBooksReport] = useState({});
  const [txReport, setTxReport] = useState([]);
  const [renewReport, setRenewReport] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [fines, setFines] = useState([]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const fetchReports = async () => {
      try {
        // Only admins can fetch reports
        if (role !== 'admin') {
          setError('You do not have permission to view reports.');
          return;
        }

        const [booksRes, txRes, renewRes, overdueRes, finesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/reports/books', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/reports/transactions', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/reports/renewals', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/reports/overdue', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/reports/fines', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setBooksReport(booksRes.data || {});
        setTxReport(txRes.data || []);
        setRenewReport(renewRes.data || []);
        setOverdue(overdueRes.data || []);
        setFines(finesRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch reports. Try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, role]);

  const toCSV = (rows) => {
    if (!rows || !rows.length) return '';
    const keys = Object.keys(rows[0]);
    const header = keys.join(',');
    const lines = rows.map(r => keys.map(k => {
      let v = r[k];
      if (v === null || v === undefined) return '';
      return `"${String(v).replace(/"/g,'""')}"`;
    }).join(','));
    return [header, ...lines].join('\n');
  };

  const downloadCSV = (rows, filename='report.csv') => {
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  if (loading) return <div><Navbar /><main className="container"><p>Loading reports...</p></main></div>;
  if (error) return <div><Navbar /><main className="container"><p style={{color:'red'}}>{error}</p></main></div>;

  // Chart data
  const booksData = {
    labels: ['Available', 'Issued'],
    datasets: [{ label: 'Books', data: [booksReport.available_books || 0, booksReport.issued_books || 0], backgroundColor: ['#4CAF50', '#FF5722'] }]
  };

  const txMonths = txReport.map(r => r.month);
  const txIssues = txReport.map(r => r.issues);
  const txReturns = txReport.map(r => r.returns);

  const transactionsData = {
    labels: txMonths,
    datasets: [
      { label: 'Issues', data: txIssues, backgroundColor: '#2196F3' },
      { label: 'Returns', data: txReturns, backgroundColor: '#FFC107' }
    ]
  };

  const renewUsers = renewReport.map(r => r.user_name);
  const renewCounts = renewReport.map(r => r.renewals_count);

  const renewData = {
    labels: renewUsers,
    datasets: [{ label: 'Renewals Count', data: renewCounts, backgroundColor: '#9C27B0' }]
  };

  return (
    <div>
      <Navbar />
      <main className="container">
        <h2>Library Reports</h2>

        <div className="grid grid-4" style={{marginBottom:20}}>
          <div className="card">
            <div className="h3">Books Summary</div>
            <p>Total: {booksReport.total_books || 0}</p>
            <p>Available: {booksReport.available_books || 0}</p>
            <p>Issued: {booksReport.issued_books || 0}</p>
            <button className="btn ghost" onClick={() => downloadCSV([booksReport], 'books_summary.csv')}>Download CSV</button>
          </div>

          <div className="card">
            <div className="h3">Transactions</div>
            <p>Total Issues: {txIssues.reduce((a,b)=>a+b,0)}</p>
            <p>Total Returns: {txReturns.reduce((a,b)=>a+b,0)}</p>
            <button className="btn ghost" onClick={() => downloadCSV(txReport, 'transactions.csv')}>Download CSV</button>
          </div>

          <div className="card">
            <div className="h3">Renewals</div>
            <p>Total Renewals: {renewCounts.reduce((a,b)=>a+b,0)}</p>
            <button className="btn ghost" onClick={() => downloadCSV(renewReport, 'renewals.csv')}>Download CSV</button>
          </div>

          <div className="card">
            <div className="h3">Overdue/Fines</div>
            <p>Check transactions page for details</p>
            <button className="btn" onClick={handlePrint}>Print</button>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid grid-3">
          <div className="card">
            <div className="h3">Books Graph</div>
            <Pie data={booksData} />
          </div>

          <div className="card">
            <div className="h3">Transactions (last 12 months)</div>
            <Bar data={transactionsData} options={{responsive:true}} />
          </div>

          <div className="card">
            <div className="h3">Renewals per User</div>
            <Bar data={renewData} options={{responsive:true}} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;

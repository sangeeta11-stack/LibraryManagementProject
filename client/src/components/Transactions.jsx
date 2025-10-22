import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { UserContext } from '../context/UserContext';
import Renew from './Renew';
import '../assets/transactions.css';

const Transactions = () => {
  const { token, role } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const url = role === 'admin' ? 'https://librarymanagementproject-69df.onrender.com/api/transactions/all' : 'https://librarymanagementproject-69df.onrender.com/api/transactions';
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token, role]);

  const onRenewSuccess = (txId, data) => {
    // refresh transactions list
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, due_date: data.new_due_date, renewals_count: (t.renewals_count || 0) + 1 } : t));
  };

  return (
    <div>
      <Navbar />
      <main className="container">
        <h2>Transactions</h2>
        <div className="card">
          {loading ? <div>Loading...</div> : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Renewals</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.book_title}</td>
                    <td>{tx.issue_date ? new Date(tx.issue_date).toLocaleString() : '-'}</td>
                    <td>{tx.due_date ? new Date(tx.due_date).toLocaleString() : '-'}</td>
                    <td>{tx.return_date ? new Date(tx.return_date).toLocaleString() : '-'}</td>
                    <td>{tx.renewals_count || 0}</td>
                    <td>{tx.status}</td>
                    <td>
                      {tx.status !== 'returned' && (
                        <>
                          <Renew txId={tx.id} onSuccess={(data) => {
                            // data has new_due_date
                            setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, due_date: data.new_due_date, renewals_count: (t.renewals_count || 0) + 1 } : t));
                          }} />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;

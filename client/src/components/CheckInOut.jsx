// client/src/components/CheckInOut.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { UserContext } from '../context/UserContext';
import '../assets/checkInOut.css'
import '../assets/global.css'
const CheckInOut = () => {
  const { token, userId, name } = useContext(UserContext);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');

  useEffect(() => {
    if (!token) return;

    axios.get('http://localhost:5000/api/books', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));

    axios.get('http://localhost:5000/api/transactions', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  }, [token]);

  const handleIssue = async () => {
    if (!selectedBook) return alert('Select a book');
    if (!userId) return alert('User ID missing (login again)');

    try {
      const res = await axios.post('http://localhost:5000/api/transactions/issue', {
        // We send only user_id and book_id; backend will read name/email from DB using user_id
        user_id: parseInt(userId),
        book_id: parseInt(selectedBook)
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert('Book issued. Due: ' + new Date(res.data.due_date).toLocaleString());

      // update UI quickly
      setBooks(prev => prev.map(b => b.id === parseInt(selectedBook) ? { ...b, available: 0 } : b));
      // refresh transactions - best to reload from server, but we'll append a placeholder:
      setTransactions(prev => [...prev, {
        id: res.data.transactionId || new Date().getTime(),
        user_id: userId,
        book_id: parseInt(selectedBook),
        book_title: books.find(b => b.id === parseInt(selectedBook))?.title || '',
        issue_date: new Date().toISOString(),
        due_date: res.data.due_date,
        status: 'issued'
      }]);

      setSelectedBook('');

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error issuing book');
    }
  };

  const handleReturn = async (tx) => {
    if (!tx || !tx.id) return;
    try {
      const res = await axios.post('http://localhost:5000/api/transactions/return', {
        transaction_id: tx.id
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert(`Returned. Overdue days: ${res.data.overdueDays}, Fine: ₹${res.data.fine}`);
      // update UI
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'returned', return_date: new Date().toISOString() } : t));
      setBooks(prev => prev.map(b => b.id === tx.book_id ? { ...b, available: 1 } : b));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error returning book');
    }
  };

  return (
    <div>
      <Navbar />
      <main style={{ padding: 20 }}>
        <h2>{name}'s Issue / Return</h2>

        <section style={{ marginBottom: 20 }}>
          <h3>Issue Book</h3>
          <select value={selectedBook} onChange={e => setSelectedBook(e.target.value)}>
            <option value="">Select Book</option>
            {books.filter(b => b.available).map(b => (
              <option key={b.id} value={b.id}>{b.title} - {b.author}</option>
            ))}
          </select>
          <button onClick={handleIssue} style={{ marginLeft: 10 }}>Issue Book</button>
        </section>

        <section>
          <h3>Your Transactions</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>ID</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
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
                  <td>{tx.status}</td>
                  <td>
                    {tx.status !== 'returned' && <button onClick={() => handleReturn(tx)}>Return</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default CheckInOut;

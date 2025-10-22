import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { UserContext } from '../context/UserContext';
import '../assets/checkInOut.css';

const Renew = () => {
  const { token } = useContext(UserContext);
  const [myIssuedBooks, setMyIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch issued books for the logged-in user
  const fetchIssuedBooks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('https://librarymanagementproject-69df.onrender.com/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeBooks = res.data.filter(t => t.status === 'issued');
      setMyIssuedBooks(activeBooks);
    } catch (err) {
      console.error(err);
      alert('Error fetching issued books');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchIssuedBooks();
  }, [fetchIssuedBooks]);

  // Handle renew
  const handleRenew = async (transactionId, renewalsCount) => {
    if (renewalsCount >= 2) {
      alert('You have already used your 2 renewals for this book.');
      return;
    }

    try {
      const res = await axios.post(
        'https://librarymanagementproject-69df.onrender.com/api/transactions/renew',
        { transaction_id: transactionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || 'Book renewed successfully');
      fetchIssuedBooks(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error renewing book');
    }
  };

  return (
    <div>
      <Navbar />
      <main className="container">
        <h2>Renew Books</h2>
        {loading ? (
          <p>Loading issued books...</p>
        ) : (
          <div className="card card-section">
            {myIssuedBooks.length === 0 ? (
              <p>You have no books to renew.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Book</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Renewals</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myIssuedBooks.map(t => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.book_title}</td>
                      <td>{new Date(t.issue_date).toLocaleDateString()}</td>
                      <td>{new Date(t.due_date).toLocaleDateString()}</td>
                      <td>{t.renewals_count || 0}</td>
                      <td>
                        {t.renewals_count >= 2 ? (
                          <span style={{ color: 'red', fontWeight: 600 }}>
                            Max renewals used
                          </span>
                        ) : (
                          <button
                            className="btn"
                            onClick={() => handleRenew(t.id, t.renewals_count)}
                          >
                            Renew
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Renew;

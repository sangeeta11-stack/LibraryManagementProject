import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { UserContext } from '../context/UserContext';
import '../assets/checkInOut.css';
import '../assets/reservation.css';

const Reservation = () => {
  const { token } = useContext(UserContext);
  const [books, setBooks] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [renewDate, setRenewDate] = useState('');
  const [renewTarget, setRenewTarget] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchBooks();
    fetchReservations();
  }, [token]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('https://librarymanagementproject-69df.onrender.com/api/books', { headers: { Authorization: `Bearer ${token}` } });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reservations/my', { headers: { Authorization: `Bearer ${token}` } });
      setMyReservations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReserve = async () => {
    if (!selectedBook) return alert('Select a book');
    if (!reservationDate) return alert('Select a reservation date');
    const today = new Date().toISOString().split('T')[0];
    if (reservationDate < today) return alert('Reservation date cannot be in the past');

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/reservations/reserve', {
        book_id: parseInt(selectedBook),
        reservation_date: reservationDate
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert(res.data.message || 'Reserved');
      await fetchReservations();
      setSelectedBook('');
      setReservationDate('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error reserving book');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await axios.post('http://localhost:5000/api/reservations/cancel', { reservation_id: reservationId }, { headers: { Authorization: `Bearer ${token}` } });
      setMyReservations(prev => prev.filter(r => r.id !== reservationId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error cancelling');
    }
  };

  const startRenew = (reservation) => {
    setRenewTarget(reservation);
    // default new date = existing reservation_date + 1 day
    const d = new Date(reservation.reservation_date);
    d.setDate(d.getDate() + 1);
    setRenewDate(d.toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRenew = async () => {
    if (!renewTarget) return alert('No reservation selected for renew');
    if (!renewDate) return alert('Select new date');
    const today = new Date().toISOString().split('T')[0];
    if (renewDate < today) return alert('New reservation date cannot be in the past');

    try {
      const res = await axios.post('http://localhost:5000/api/reservations/renew', {
        reservation_id: renewTarget.id,
        new_date: renewDate
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert(res.data.message || 'Renewed');
      // refresh list
      await fetchReservations();
      setRenewTarget(null);
      setRenewDate('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error renewing');
    }
  };

  const statusLabel = (r) => {
    const today = new Date().toISOString().split('T')[0];
    if (r.status === 'cancelled') return 'Cancelled';
    if (r.status === 'fulfilled') return 'Fulfilled';
    if (r.status === 'expired') return 'Expired';
    if (r.reservation_date > today) return 'Upcoming';
    return 'Active';
  };

  return (
    <div>
      <Navbar />
      <main className="container">
        <div className="card" style={{marginBottom:16}}>
          <h2>Reserve a Book</h2>
          <div className="issue-form" style={{alignItems:'center', gap:12, flexWrap:'wrap'}}>
            <select value={selectedBook} onChange={e => setSelectedBook(e.target.value)} style={{minWidth:220}}>
              <option value="">Select Book</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author} {b.available ? '(Available)' : '(Unavailable)'}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={reservationDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setReservationDate(e.target.value)}
            />

            <button className="btn" onClick={handleReserve} disabled={loading}>
              {loading ? 'Reserving...' : 'Reserve'}
            </button>
          </div>
        </div>

        {renewTarget && (
          <div className="card" style={{marginBottom:16}}>
            <h3>Renew Reservation for: {renewTarget.book_title}</h3>
            <div className="issue-form" style={{alignItems:'center', gap:12}}>
              <input type="date" value={renewDate} min={new Date().toISOString().split('T')[0]} onChange={e => setRenewDate(e.target.value)} />
              <button className="btn" onClick={handleRenew}>Confirm Renew</button>
              <button className="btn ghost" onClick={() => { setRenewTarget(null); setRenewDate(''); }}>Cancel</button>
            </div>
          </div>
        )}

        <section className="card card-section">
          <h3>My Reservations</h3>
          <div style={{overflowX:'auto'}}>
            <table className="table" style={{minWidth:900}}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Reservation Date</th>
                  <th>Reserved At</th>
                  <th>Position</th>
                  <th>Renewals</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myReservations.length === 0 && (
                  <tr><td colSpan="8" style={{textAlign:'center'}}>No reservations found</td></tr>
                )}
                {myReservations.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.book_title}</td>
                    <td>{r.reservation_date ? r.reservation_date : '-'}</td>
                    <td>{r.reserved_at ? new Date(r.reserved_at).toLocaleString() : '-'}</td>
                    <td>{r.position || '-'}</td>
                    <td>{r.renewals_count || 0}</td>
                    <td>{statusLabel(r)}</td>
                    <td>
                      {r.status === 'active' && (
                        <>
                          <button className="btn ghost" onClick={() => startRenew(r)} style={{marginRight:8}}>Renew</button>
                          <button className="btn" onClick={() => handleCancel(r.id)}>Cancel</button>
                        </>
                      )}
                      {r.status !== 'active' && <span className="p-muted">{r.status}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reservation;

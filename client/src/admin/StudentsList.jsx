import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import { UserContext } from '../context/UserContext';
import '../assets/books.css';

const StudentsList = () => {
  const { token } = useContext(UserContext);
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('https://librarymanagementproject-69df.onrender.com/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err.response || err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const getBooksByStatus = (transactions, status) =>
    transactions.filter(t => t.status === status);

  const formatBooksList = (books) => {
    if (!books || books.length === 0) return '—';
    return books.map(b => b.book_title).join(', ');
  };

  return (
    <div className="students-container">
      <AdminNavbar />
      <main className="students-main">
        <h2>Students List</h2>
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Issued Books</th>
                <th>Reserved Books</th>
                <th>Renewed Books</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No students found.</td>
                </tr>
              )}
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.role}</td>
                  <td>{formatBooksList(getBooksByStatus(student.transactions, 'issued'))}</td>
                  <td>{formatBooksList(getBooksByStatus(student.transactions, 'reserved'))}</td>
                  <td>{formatBooksList(getBooksByStatus(student.transactions, 'renewed'))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentsList;

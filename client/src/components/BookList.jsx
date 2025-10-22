import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { UserContext } from '../context/UserContext';
import '../assets/books.css'

const BookList = () => {
  const { token } = useContext(UserContext);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get('https://librarymanagementproject-69df.onrender.com/api/books', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBooks(res.data))
      .catch(err => console.log(err));
  }, [token]);

  return (
    <div>
      <Navbar />
      <main className="dashboard-main">
        <h2>Books List</h2>
        <ul>
          {books.map(book => (
            <li key={book.id}>{book.title} - {book.author} ({book.available ? 'Available' : 'Issued'})</li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default BookList;

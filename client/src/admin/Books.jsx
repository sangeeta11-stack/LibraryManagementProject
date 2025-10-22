import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import '../assets/books.css';
import { UserContext } from '../context/UserContext';

const Books = () => {
  const { token } = useContext(UserContext);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', category: '', available: 1 });
  const [editId, setEditId] = useState(null);

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const res = await axios.get('https://librarymanagementproject-69df.onrender.com/api/books', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err.response || err);
    }
  };

  useEffect(() => { fetchBooks(); }, [token]);

  // Handle input changes
  const handleChange = e => {
    const { name, value, checked, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, available: checked ? 1 : 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Add or Update book
  const handleAddOrUpdate = async () => {
    if (!form.title || !form.author || !form.category) {
      alert('Please fill all fields!');
      return;
    }

    try {
      if (editId) {
        await axios.put(`https://librarymanagementproject-69df.onrender.com/api/books/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Book updated successfully!');
      } else {
        await axios.post('https://librarymanagementproject-69df.onrender.com/api/books', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Book added successfully!');
      }
      setForm({ title: '', author: '', category: '', available: 1 });
      setEditId(null);
      fetchBooks();
    } catch (err) {
      console.error('Error saving book:', err.response || err);
      alert('Error saving book');
    }
  };

  // Edit a book
  const handleEdit = book => {
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      available: book.available
    });
    setEditId(book.id);
  };

  // Delete a book
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`https://librarymanagementproject-69df.onrender.com/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Book deleted successfully!');
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err.response || err);
      alert('Error deleting book');
    }
  };

  return (
    <div className="books-container">
      <AdminNavbar />
      <main className="books-main">
        <h2>Manage Books</h2>

        {/* Form */}
        <div className="books-form">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />
          <input
            name="author"
            placeholder="Author"
            value={form.author}
            onChange={handleChange}
          />
          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />
          <label className="available-label">
            <input
              name="available"
              type="checkbox"
              checked={form.available === 1}
              onChange={handleChange}
            />
            Available
          </label>
          <button className="btn-primary" onClick={handleAddOrUpdate}>
            {editId ? 'Update Book' : 'Add Book'}
          </button>
          {editId && (
            <button
              className="btn-secondary"
              onClick={() => { setEditId(null); setForm({ title: '', author: '', category: '', available: 1 }); }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Books Table */}
        <div className="table-wrapper">
          <table className="books-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No books found</td>
                </tr>
              ) : (
                books.map(book => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td>{book.available ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(book)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(book.id)}>Delete</button>
                    </td>
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

export default Books;

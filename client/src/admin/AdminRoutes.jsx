import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Books from './Books';
import Users from './StudentsList';
import Transactions from './Transactions';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="books" element={<Books />} />
      <Route path="users" element={<Users />} />
      <Route path="transactions" element={<Transactions />} />

      {/* Catch-all for admin */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;

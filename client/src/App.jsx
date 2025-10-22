import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';

// Components
import MainPage from './components/MainPage';
import LoginAdmin from './admin/LoginAdmin';
import Login from './components/Login';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import CheckInOut from './components/CheckInOut';
import PasswordManagement from './components/PasswordManagement';
import Reservation from './components/Reservation';
import Renew from './components/Renew';
import Reports from './components/Reports';
import Transactions from './components/Transactions';

// Admin Components
import AdminDashboard from './admin/AdminDashboard';
import AdminRoutes from './admin/AdminRoutes';

function App() {
  // Protected route for role-based access
  const ProtectedRoute = ({ children, allowedRole }) => {
    const { token, role } = React.useContext(UserContext);

    if (!token) {
      return <Navigate to="/login/student" replace />;
    }

    if (allowedRole && role !== allowedRole) {
      return <Navigate to="/login/student" replace />;
    }

    return children;
  };

  // Private route for any logged-in user
  const PrivateRoute = ({ children }) => {
    const { token } = React.useContext(UserContext);

    if (!token) return <Navigate to="/login/student" replace />;

    return children;
  };

  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login/admin" element={<LoginAdmin />} />
          <Route path="/login/student" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/books"
            element={
              <PrivateRoute>
                <BookList />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkinout"
            element={
              <PrivateRoute>
                <CheckInOut />
              </PrivateRoute>
            }
          />
          <Route
            path="/password"
            element={
              <PrivateRoute>
                <PasswordManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/reservation"
            element={
              <PrivateRoute>
                <Reservation />
              </PrivateRoute>
            }
          />
          <Route
            path="/renew"
            element={
              <PrivateRoute>
                <Renew />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;

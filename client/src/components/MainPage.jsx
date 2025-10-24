import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/mainpage.css'; // optional for styling

const MainPage = () => {
  const navigate = useNavigate();

  const goToStudentLogin = () => {
    navigate('/login/student');
  };

  const goToAdminLogin = () => {
    navigate('/login/admin');
  };

  return (
    <div className="main-container">
      <h1>Welcome to Smart Library System</h1>
      <p>Select your role to continue</p>

      <div className="role-buttons">
        <button className="btn primary" onClick={goToStudentLogin}>
          Student
        </button>
        <button className="btn secondary" onClick={goToAdminLogin}>
          Admin
        </button>
      </div>
    </div>
  );
};

export default MainPage;

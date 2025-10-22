import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/global.css'; // LOAD FIRST
import './assets/navbar.css'; // can be optional here
import './assets/login.css';
import './assets/register.css';
import './assets/dashboard.css';
import './assets/books.css';
import './assets/checkInOut.css';
import './assets/transactions.css';
import './assets/footer.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

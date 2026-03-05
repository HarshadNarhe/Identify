// identify/src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if the user is logged in by looking for the token
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Clicking the logo takes them to the dashboard if logged in, otherwise to login */}
        <Link to={token ? "/dashboard" : "/login"}>Identify</Link>
      </div>
      
      <ul className="navbar-links">
        {token ? (
          // IF USER IS LOGGED IN: Show these links
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><button onClick={handleLogout} className="nav-logout-btn">Logout</button></li>
          </>
        ) : (
          // IF USER IS NOT LOGGED IN: Show these links
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="nav-btn-primary">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css'; // <-- Import your new styles

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 120-Second Inactivity Tracker
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 120 seconds = 120000 milliseconds
      timeoutId = setTimeout(() => {
        handleLogout();
        alert('Security Alert: Your session has expired due to 120 seconds of inactivity.');
      }, 120000); 
    };

    // Listen for any user interaction
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer(); // Start the timer immediately when they load the page

    // Cleanup function to prevent memory leaks if they leave the page manually
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [navigate]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>Welcome to your Dashboard</h1>
        <p>You are securely logged in.</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Card 1: Security Status */}
        <div className="dashboard-card">
          <h3>Security Status</h3>
          <p>Your connection is secured with a JSON Web Token (JWT). For your safety, an automatic inactivity monitor is currently active.</p>
          <div className="security-badge">
            ⏱️ 120s Auto-Logout Active
          </div>
        </div>

        {/* Card 2: Account Details */}
        <div className="dashboard-card">
          <h3>Account Actions</h3>
          <p>This is a protected route. Only authenticated users with a valid token can view this page.</p>
          <button 
            onClick={handleLogout} 
            style={{ 
              marginTop: '15px', 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Log Out Manually
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
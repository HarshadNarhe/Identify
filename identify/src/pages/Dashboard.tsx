import React from 'react'; // <-- 1. Removed useEffect from here
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // <-- 2. The entire 120-Second Inactivity Tracker useEffect block was deleted from here!

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>Welcome to your Dashboard</h1>
        <p>You are securely logged in.</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Card 1: Clickable Student Registration Patch */}
        <div 
          className="dashboard-card" 
          onClick={() => navigate('/register-student')}
          style={{ 
            cursor: 'pointer', 
            borderTop: '4px solid #28a745',
            transition: 'transform 0.2s ease, boxShadow 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3>📝 Register New Student</h3>
          <p>Click anywhere on this card to add a new student to the database.</p>
        </div>

        {/* Card 2: Clickable Add Marks Patch */}
        <div 
          className="dashboard-card" 
          onClick={() => navigate('/add-marks')}
          style={{ 
            cursor: 'pointer', 
            borderTop: '4px solid #ffc107',
            transition: 'transform 0.2s ease, boxShadow 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3>📊 Enter Student Marks</h3>
          <p>Click anywhere on this card to record semester grades for a student.</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
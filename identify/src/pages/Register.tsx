import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../Auth.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // <-- 1. New state
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // <-- 2. Frontend Validation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      return; // Stop the function here so it doesn't talk to the backend
    }

    try {
      await axios.post('http://localhost:5000/register', { username, password });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleRegister}>
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              className="form-input"
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Create a password"
            />
          </div>

          {/* <-- 3. New Confirm Password Input */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              className="form-input"
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="auth-button">Register</button>
        </form>

        {message && (
          <div className={message.includes('successful') ? 'message-success' : 'message-error'}>
            {message}
          </div>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
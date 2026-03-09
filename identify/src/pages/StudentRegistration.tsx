import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../StudentRegistration.css';

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  
  const [studentName, setStudentName] = useState('');
  const [standard, setStandard] = useState('5');
  const [division, setDivision] = useState('A'); 
  const [rawStudentNumber, setRawStudentNumber] = useState('');
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [savedId, setSavedId] = useState(''); 

  // Example: Division A, Standard 5, Roll 12 -> A5012
  const generateId = (div: string, std: string, num: string) => {
    const paddedNum = num.padStart(3, '0');
    return `${div}${std}${paddedNum}`;
  };

  // Restricts input to exactly 2 numeric digits
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Replace anything that isn't a digit (0-9) with an empty string
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    
    // Only update state if it's 2 characters or less
    if (onlyNumbers.length <= 2) {
      setRawStudentNumber(onlyNumbers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSavedId('');

    if (!rawStudentNumber) {
      setIsError(true);
      setMessage('Please enter a 2-digit student number.');
      return;
    }
    
    const finalStudentId = generateId(division, standard, rawStudentNumber);
    
    try {
      await axios.post('http://localhost:5000/students', {
        student_id: finalStudentId,      // The generated VARCHAR(5) Primary Key
        student_no: parseInt(rawStudentNumber), // The INT(2) column
        student_name: studentName,
        standard: parseInt(standard),    // Ensure it matches INT(1)
        division: division
      });
      
      setIsError(false);
      setMessage('Student successfully registered!');
      setSavedId(finalStudentId); // Save the ID to display it on the screen
      
      // Clear the form fields
      setStudentName('');
      setRawStudentNumber('');
      setStandard('5');
      setDivision('A');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.response?.data?.error || 'Failed to register student. Ensure the student number is unique.');
    }
  };

  return (
    <div className="student-form-wrapper">
      <div className="student-form-card">
        
        <div className="student-form-header">
          <h2>Register Student</h2>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Student Name</label>
            <input 
              className="form-input" 
              type="text" 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)} 
              required 
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Standard</label>
              <select 
                className="form-input" 
                value={standard} 
                onChange={(e) => setStandard(e.target.value)}
              >
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </select>
            </div>
            
            <div className="form-col">
              <label className="form-label">Division</label>
              <select 
                className="form-input" 
                value={division} 
                onChange={(e) => setDivision(e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Student Roll Number (Max 2 Digits)</label>
            <input 
              className="form-input" 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              value={rawStudentNumber} 
              onChange={handleNumberChange} 
              required 
              placeholder="e.g. 12"
            />
          </div>

          <button type="submit" className="submit-btn">Save Student Record</button>
        </form>

        {/* Display Error Message */}
        {message && isError && (
          <div className="message-error">
            {message}
          </div>
        )}

        {/* Display Success Message WITH Primary Key */}
        {message && !isError && savedId && (
          <div className="message-success" style={{ padding: '20px' }}>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>{message}</div>
            <div style={{ fontSize: '14px', color: '#155724' }}>Generated Primary Key:</div>
            <strong style={{ fontSize: '24px', letterSpacing: '2px', display: 'block', marginTop: '5px' }}>
              {savedId}
            </strong>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentRegistration;
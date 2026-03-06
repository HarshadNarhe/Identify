// identify/src/pages/StudentMarks.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../StudentRegistration.css'; // Reusing the wrapper styles
import '../MarksForm.css'; // The new grid styles

interface Student {
  student_id: string;
  student_name: string;
}

const subjectsList = ['English', 'Marathi', 'Hindi', 'Maths', 'Science', 'History', 'Geography'];

const StudentMarks: React.FC = () => {
  const navigate = useNavigate();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [semester, setSemester] = useState('');
  
  // Create an object to hold marks for all 7 subjects
  const [marks, setMarks] = useState<Record<string, string>>({
    English: '', Marathi: '', Hindi: '', Maths: '', Science: '', History: '', Geography: ''
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Fetch the students as soon as the page loads
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/students');
        setStudents(response.data);
      } catch (error) {
        console.error('Failed to load students');
      }
    };
    fetchStudents();
  }, []);

  const handleMarkChange = (subject: string, value: string) => {
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setMarks(prev => ({ ...prev, [subject]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!selectedStudent || !semester) {
      setIsError(true);
      setMessage('Please select both a student and a semester.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/marks', {
        student_id: selectedStudent,
        semester: semester,
        marks: marks // Sends the whole object of 7 subjects
      });
      
      setIsError(false);
      setMessage('Marks successfully saved to the database!');
      
      // Clear the marks but keep the student selected in case they want to add another semester
      setMarks({
        English: '', Marathi: '', Hindi: '', Maths: '', Science: '', History: '', Geography: ''
      });
      setSemester('');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.response?.data?.error || 'Failed to save marks.');
    }
  };

  return (
    <div className="student-form-wrapper">
      <div className="marks-form-card">
        
        <div className="student-form-header">
          <h2>Enter Semester Marks</h2>
          <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Select Student</label>
            <select 
              className="form-input" 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="" disabled>-- Choose a Student --</option>
              {students.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.student_name} ({student.student_id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Semester</label>
            <select 
              className="form-input" 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="" disabled>-- Choose Semester --</option>
              <option value="First">First Semester</option>
              <option value="Mid">Mid Semester</option>
              <option value="Third">Third Semester</option>
              <option value="Last">Last Semester</option>
            </select>
          </div>

          <label className="form-label" style={{ marginTop: '25px' }}>Subject Marks (Out of 100)</label>
          <div className="subjects-grid">
            {subjectsList.map((subject) => (
              <div key={subject} className="form-group" style={{ marginBottom: '0' }}>
                <div className="subject-label">{subject}</div>
                <input 
                  type="text" 
                  inputMode="decimal"
                  className="marks-input"
                  value={marks[subject]}
                  onChange={(e) => handleMarkChange(subject, e.target.value)}
                  placeholder="0.00"
                  required // Makes filling every subject absolutely mandatory
                />
              </div>
            ))}
          </div>

          <button type="submit" className="marks-submit-btn">Save All Marks</button>
        </form>

        {message && (
          <div className={isError ? 'message-error' : 'message-success'}>
            {message}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentMarks;
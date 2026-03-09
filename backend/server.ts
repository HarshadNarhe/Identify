import express, { type Request, type Response } from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_super_secret_key_change_this_later';

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: 'admin', 
  database: 'auth_demo',
});

// Registration Route
app.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Username might already exist.' });
  }
});

// Login Route
app.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    const [rows]: any = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Token expires in 1 hour on the backend
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Logged in successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Student Registration Route
app.post('/students', async (req: Request, res: Response): Promise<void> => {
  try {
    const { student_id, student_no, student_name, standard, division } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO students (student_id, student_no, student_name, standard, division) VALUES (?, ?, ?, ?, ?)',
      [student_id, student_no, student_name, standard, division]
    );
    
    res.status(201).json({ message: 'Student registered successfully!' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'A student with this Roll Number or generated ID already exists in the database.' });
    } else {
      console.error('Database Error:', error); 
      res.status(500).json({ error: 'Database error while registering student.' });
    }
  }
});

// 1. Fetch all students for the dropdown
app.get('/students', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT student_id, student_name FROM students ORDER BY student_name ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students from database.' });
  }
});

// 2. Submit Marks Route
app.post('/marks', async (req: Request, res: Response): Promise<void> => {
  try {
    const { student_id, semester, marks } = req.body;
    
    const semesterColumnMap: Record<string, string> = {
      'First': 'first_sem_marks',
      'Mid': 'mid_sem_marks',
      'Third': 'third_sem_marks',
      'Last': 'last_sem_marks'
    };
    const semColumn = semesterColumnMap[semester];

    if (!semColumn) {
      res.status(400).json({ error: 'Invalid semester selected.' });
      return;
    }

    for (const [subject, mark] of Object.entries(marks)) {
      const [existingRows]: any = await pool.execute(
        'SELECT mark_id FROM subject_marks WHERE student_id = ? AND subject = ?',
        [student_id, subject]
      );

      if (existingRows.length > 0) {
        await pool.execute(
          `UPDATE subject_marks SET ${semColumn} = ? WHERE student_id = ? AND subject = ?`,
          [mark, student_id, subject]
        );
      } else {
        await pool.execute(
          `INSERT INTO subject_marks (student_id, subject, ${semColumn}) VALUES (?, ?, ?)`,
          [student_id, subject, mark]
        );
      }
    }

    res.status(200).json({ message: 'Marks successfully saved for all subjects!' });
  } catch (error: any) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Database error while saving marks.' });
  }
});

// Analytics Route: Fetch averages for graphs
app.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    // --- THIS IS THE PART THAT CHANGED ---
    const standard = req.query.standard as string;
    const semester = req.query.semester as string;

    if (!standard || !semester) {
      res.status(400).json({ error: 'Missing standard or semester in the request.' });
      return;
    }

    let markFormula = '';
    if (semester === 'First') markFormula = 'm.first_sem_marks';
    else if (semester === 'Mid') markFormula = 'm.mid_sem_marks';
    else if (semester === 'Third') markFormula = 'm.third_sem_marks';
    else if (semester === 'Last') markFormula = 'm.last_sem_marks';
    else if (semester === 'All') markFormula = '(m.first_sem_marks + m.mid_sem_marks + m.third_sem_marks + m.last_sem_marks) / 4';
    else {
      res.status(400).json({ error: 'Invalid semester selected.' });
      return;
    }

    const query = `
      SELECT 
        m.subject, 
        s.division, 
        ROUND(AVG(${markFormula}), 2) as avg_mark
      FROM subject_marks m
      JOIN students s ON m.student_id = s.student_id
      WHERE s.standard = ?
      GROUP BY m.subject, s.division
    `;

    const [rows]: any = await pool.execute(query, [standard]);

    const formattedData: Record<string, any> = {};
    
    const subjectsList = ['English', 'Marathi', 'Hindi', 'Maths', 'Science', 'History', 'Geography'];
    subjectsList.forEach(sub => {
      formattedData[sub] = { subject: sub };
    });

    rows.forEach((row: any) => {
      if (formattedData[row.subject]) {
        formattedData[row.subject][row.division] = parseFloat(row.avg_mark); 
      }
    });

    res.status(200).json(Object.values(formattedData));

  } catch (error: any) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data.' });
  }
});

app.listen(5000, () => console.log('Backend server running on port 5000'));
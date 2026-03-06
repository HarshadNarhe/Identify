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
  user: 'root', // Change to your MySQL username
  password: 'admin', // Change to your MySQL password
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

    // Token expires in 1 hour on the backend, but we will enforce 120s inactivity on the frontend
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Logged in successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Student Registration Route
app.post('/students', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. We now extract all 5 fields sent from the React frontend
    const { student_id, student_no, student_name, standard, division } = req.body;
    
    // 2. The SQL query is updated to match your new table structure perfectly
    const [result] = await pool.execute(
      'INSERT INTO students (student_id, student_no, student_name, standard, division) VALUES (?, ?, ?, ?, ?)',
      [student_id, student_no, student_name, standard, division]
    );
    
    res.status(201).json({ message: 'Student registered successfully!' });
  } catch (error: any) {
    // Catch duplicate entries (either the student_id or student_no)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'A student with this Roll Number or generated ID already exists in the database.' });
    } else {
      console.error('Database Error:', error); // Prints the exact error in your terminal for debugging
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
    
    // Map the dropdown selection to the exact database column name
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

    // Loop through the 7 subjects sent from the frontend
    for (const [subject, mark] of Object.entries(marks)) {
      // Check if this student already has a row for this specific subject
      const [existingRows]: any = await pool.execute(
        'SELECT mark_id FROM subject_marks WHERE student_id = ? AND subject = ?',
        [student_id, subject]
      );

      if (existingRows.length > 0) {
        // If the row exists, UPDATE the specific semester column
        await pool.execute(
          `UPDATE subject_marks SET ${semColumn} = ? WHERE student_id = ? AND subject = ?`,
          [mark, student_id, subject]
        );
      } else {
        // If the row doesn't exist, INSERT a new row
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


app.listen(5000, () => console.log('Backend server running on port 5000'));
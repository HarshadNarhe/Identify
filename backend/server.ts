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

app.listen(5000, () => console.log('Backend server running on port 5000'));
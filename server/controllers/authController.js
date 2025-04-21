const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
  
    try {
      const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      const hash = await bcrypt.hash(password, 10);
  
      const userRole = role || 'member';
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hash, userRole]
      );
  
      const token = generateToken(result.rows[0]);
      res.json({ token, user: result.rows[0] });
    } catch (err) {
      console.error('Error during user registration:', err);  // Log the full error
      res.status(500).json({ error: 'User registration failed', message: err.message });
    }
  };
  

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};

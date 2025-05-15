//Arwad Rahal & Ayman Zeed
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const router = express.Router();
const saltRounds = 10;

// הכנת מסד הנתונים
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'myshop'
});

// 📌 1. הוסף משתמש חדש עם קוד קוד (Hash) לסיסמה

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'User created successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// 📌 2. שנה את הסיסמה ושמור אותה כקובץ גיבוב
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    db.query(
      'UPDATE users SET username = ?, password = ? WHERE id = ?',
      [username, hashedPassword, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// 📌 3. אימות כניסה וסיסמה של משתמש

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Incorrect password' });
    }
  });
});

module.exports = router;

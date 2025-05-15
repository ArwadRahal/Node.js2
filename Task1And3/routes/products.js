//Arwad Rahal & Ayman Zeed
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

 const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'myshop'
});

// ✅ קבל את כל המוצרים (עם הגבלה)
router.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  let sql = 'SELECT * FROM products';
  if (limit) sql += ' LIMIT ?';

  db.query(sql, limit ? [limit] : [], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ✅ הביאו מוצר אחד
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send({ message: 'Not found' });
    res.json(result[0]);
  });
});

// ✅ הוסף מוצר
router.post('/', (req, res) => {
  const { name, price } = req.body;
  db.query('INSERT INTO products (name, price) VALUES (?, ?)', [name, price], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ id: result.insertId, name, price });
  });
});

// ✅ עדכון מוצר
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, price } = req.body;
  db.query('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Product updated' });
  });
});

// ✅ מחיקת מוצר
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Product deleted' });
  });
});

module.exports = router;

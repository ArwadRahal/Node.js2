// routes/articles.js
const express     = require('express');
const dbSingleton = require('../dbSingleton');
const router      = express.Router();
const db          = dbSingleton.getConnection();
 
router.post('/', (req, res, next) => {
  const { title, content, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  const sql = `
    INSERT INTO articles (title, content, author)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [title, content || null, author], (err, result) => {
    if (err) return next(err);
    db.query(
      'SELECT * FROM articles WHERE id = ?',
      [result.insertId],
      (err2, rows) => {
        if (err2) return next(err2);
        res.status(201).json(rows[0]);
      }
    );
  });
});
 
router.get('/authors', (req, res, next) => {
  db.query('SELECT DISTINCT author FROM articles', (err, rows) => {
    if (err) return next(err);
    res.json(rows.map(r => r.author));
  });
});
 
router.get('/count', (req, res, next) => {
  db.query('SELECT COUNT(*) AS count FROM articles', (err, rows) => {
    if (err) return next(err);
    res.json({ count: rows[0].count });
  });
});
 
 router.get('/', (req, res, next) => {
  const { author, created_after, keyword, sort } = req.query;
  const conds = [];
  const params = [];

  if (author) {
    conds.push('author = ?');
    params.push(author);
  }
  if (created_after) {
    conds.push('created_at > ?');
    params.push(created_after);
  }
  if (keyword) {
    conds.push('title LIKE ?');
    params.push(`%${keyword}%`);
  }

  let sql = 'SELECT * FROM articles';
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
  sql += (sort === 'created_at_desc')
       ? ' ORDER BY created_at DESC'
       : ' ORDER BY id';

  db.query(sql, params, (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});
 
router.get('/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid article ID' });

  db.query('SELECT * FROM articles WHERE id = ?', [id], (err, rows) => {
    if (err) return next(err);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  });
});

 
router.put('/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { title, content, author } = req.body;
  if (isNaN(id) || !title || !author) {
    return res.status(400).json({ error: 'Invalid ID, title and author required' });
  }

  const sql = `
    UPDATE articles
    SET title = ?, content = ?, author = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.query(sql, [title, content || null, author, id], (err, result) => {
    if (err) return next(err);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    db.query('SELECT * FROM articles WHERE id = ?', [id], (err2, rows) => {
      if (err2) return next(err2);
      res.json(rows[0]);
    });
  });
});

 
router.delete('/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid article ID' });

  db.query('DELETE FROM articles WHERE id = ?', [id], (err, result) => {
    if (err) return next(err);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  });
});

module.exports = router;

const express = require('express');
const db = require('./db');
const { validateStudent } = require('./validate');

const router = express.Router();

const stmts = {
  insert: db.prepare('INSERT INTO students (name, email, course, age) VALUES (@name, @email, @course, @age)'),
  byId:   db.prepare('SELECT * FROM students WHERE id = ?'),
  count:  db.prepare('SELECT COUNT(*) AS n FROM students WHERE (@q IS NULL OR name LIKE @like OR email LIKE @like OR course LIKE @like)'),
  list:   db.prepare(`SELECT * FROM students
                      WHERE (@q IS NULL OR name LIKE @like OR email LIKE @like OR course LIKE @like)
                      ORDER BY id LIMIT @limit OFFSET @offset`),
  delete: db.prepare('DELETE FROM students WHERE id = ?'),
};

const parseId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ success: false, error: 'id must be a positive integer' });
    return null;
  }
  return id;
};

// CREATE
router.post('/', (req, res) => {
  const { errors, value } = validateStudent(req.body, false);
  if (errors.length) return res.status(400).json({ success: false, errors });
  const info = stmts.insert.run(value);
  res.status(201).json({ success: true, data: stmts.byId.get(info.lastInsertRowid) });
});

// READ (all) - supports ?page=1&limit=10&q=search
router.get('/', (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const q = req.query.q ? String(req.query.q) : null;
  const like = `%${q}%`;
  const total = stmts.count.get({ q, like }).n;
  res.json({
    success: true,
    page, limit, total,
    totalPages: Math.ceil(total / limit),
    data: stmts.list.all({ q, like, limit, offset: (page - 1) * limit }),
  });
});

// READ (one)
router.get('/:id', (req, res) => {
  const id = parseId(req, res); if (id === null) return;
  const row = stmts.byId.get(id);
  if (!row) return res.status(404).json({ success: false, error: 'Student not found' });
  res.json({ success: true, data: row });
});

// UPDATE: PUT replaces all fields, PATCH changes only the fields sent
function update(partial) {
  return (req, res) => {
    const id = parseId(req, res); if (id === null) return;
    if (!stmts.byId.get(id)) return res.status(404).json({ success: false, error: 'Student not found' });
    const { errors, value } = validateStudent(req.body, partial);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const sets = Object.keys(value).map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE students SET ${sets}, updated_at = datetime('now') WHERE id = @id`).run({ ...value, id });
    res.json({ success: true, data: stmts.byId.get(id) });
  };
}
router.put('/:id', update(false));
router.patch('/:id', update(true));

// DELETE
router.delete('/:id', (req, res) => {
  const id = parseId(req, res); if (id === null) return;
  const info = stmts.delete.run(id);
  if (!info.changes) return res.status(404).json({ success: false, error: 'Student not found' });
  res.json({ success: true, message: `Student ${id} deleted` });
});

module.exports = router;

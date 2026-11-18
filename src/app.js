const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'));

app.get('/', (req, res) => res.json({
  name: 'Student CRUD API',
  status: 'running',
  endpoints: {
    health: 'GET /health',
    create: 'POST /api/students',
    list: 'GET /api/students?page=1&limit=10&q=text',
    read: 'GET /api/students/:id',
    update: 'PUT /api/students/:id',
    partialUpdate: 'PATCH /api/students/:id',
    delete: 'DELETE /api/students/:id',
  },
}));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/students', routes);

// 404
app.use((req, res) => res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` }));

// Error handler (bad JSON, unique-constraint violations, etc.)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ success: false, error: 'A student with this email already exists' });
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = app;

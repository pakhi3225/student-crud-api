// Integration tests using Node's built-in test runner against an in-memory DB.
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server, base;
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
test.after(() => server.close());

const call = async (method, path, body) => {
  const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  return { status: res.status, json: await res.json() };
};
const sample = { name: 'Asha Patil', email: 'asha@example.com', course: 'Computer Science', age: 21 };

test('CRUD lifecycle', async () => {
  let r = await call('POST', '/api/students', sample);
  assert.equal(r.status, 201);
  const id = r.json.data.id;

  r = await call('GET', `/api/students/${id}`);
  assert.equal(r.status, 200); assert.equal(r.json.data.email, sample.email);

  r = await call('GET', '/api/students?q=asha');
  assert.equal(r.json.total, 1);

  r = await call('PUT', `/api/students/${id}`, { ...sample, course: 'Data Science', age: 22 });
  assert.equal(r.json.data.course, 'Data Science');

  r = await call('PATCH', `/api/students/${id}`, { age: 23 });
  assert.equal(r.json.data.age, 23); assert.equal(r.json.data.course, 'Data Science');

  r = await call('DELETE', `/api/students/${id}`);
  assert.equal(r.status, 200);
  r = await call('GET', `/api/students/${id}`);
  assert.equal(r.status, 404);
});

test('validation and error handling', async () => {
  let r = await call('POST', '/api/students', { name: 'A', email: 'bad', age: 'x' });
  assert.equal(r.status, 400); assert.ok(r.json.errors.length >= 3);

  const created = await call('POST', '/api/students', { ...sample, email: 'dup@example.com' });
  r = await call('POST', '/api/students', { ...sample, email: 'dup@example.com' });
  assert.equal(r.status, 409);

  r = await call('GET', '/api/students/abc');
  assert.equal(r.status, 400);
  r = await call('DELETE', '/api/students/99999');
  assert.equal(r.status, 404);
  r = await call('PATCH', `/api/students/${created.json.data.id}`, {});
  assert.equal(r.status, 400);
});

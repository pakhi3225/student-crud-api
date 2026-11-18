const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns { errors: [...], value: {...} }. When `partial` is true (PATCH), fields are optional.
function validateStudent(body = {}, partial = false) {
  const errors = [];
  const value = {};
  const rules = {
    name:   (v) => typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 100,
    email:  (v) => typeof v === 'string' && EMAIL_RE.test(v.trim()),
    course: (v) => typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 100,
    age:    (v) => Number.isInteger(v) && v >= 5 && v <= 120,
  };
  const messages = {
    name: 'name must be a string of 2-100 characters',
    email: 'email must be a valid email address',
    course: 'course must be a string of 2-100 characters',
    age: 'age must be an integer between 5 and 120',
  };

  for (const field of Object.keys(rules)) {
    const present = body[field] !== undefined;
    if (!present) {
      if (!partial) errors.push(`${field} is required`);
      continue;
    }
    if (!rules[field](body[field])) errors.push(messages[field]);
    else value[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
  }
  if (partial && Object.keys(value).length === 0 && errors.length === 0) {
    errors.push('provide at least one of: name, email, course, age');
  }
  return { errors, value };
}

module.exports = { validateStudent };

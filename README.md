# Student CRUD API

A REST API that performs **Create, Read, Update, Delete** operations on a database.

- **Stack:** Node.js 18+, Express 5, SQLite (`better-sqlite3`)
- **Features:** input validation, pagination + search, proper HTTP status codes, unique-email handling, security headers (helmet), CORS, request logging, automated tests, Postman collection

## Project structure
```
student-crud-api/
├── src/
│   ├── server.js      # starts the server
│   ├── app.js         # Express app, middleware, error handling
│   ├── routes.js      # CRUD endpoints
│   ├── db.js          # SQLite connection + table creation
│   └── validate.js    # request validation
├── tests/api.test.js  # automated integration tests
├── postman/Student-CRUD-API.postman_collection.json
├── render.yaml        # one-click deploy config for Render
├── .env.example
└── package.json
```

## Run locally
```bash
npm install
npm start            # http://localhost:3000
npm test             # run automated tests
```

## API endpoints
| Method | Endpoint              | Description                          | Success |
|--------|-----------------------|--------------------------------------|---------|
| GET    | `/health`             | Health check                         | 200     |
| POST   | `/api/students`       | **Create** a student                 | 201     |
| GET    | `/api/students`       | **Read** all (`?page=&limit=&q=`)    | 200     |
| GET    | `/api/students/:id`   | **Read** one                         | 200     |
| PUT    | `/api/students/:id`   | **Update** (replace all fields)      | 200     |
| PATCH  | `/api/students/:id`   | **Update** (only fields sent)        | 200     |
| DELETE | `/api/students/:id`   | **Delete**                           | 200     |

Error codes: `400` validation/bad id/bad JSON, `404` not found, `409` duplicate email, `500` server error.

### Request body (POST / PUT)
```json
{ "name": "Asha Patil", "email": "asha@example.com", "course": "Computer Science", "age": 21 }
```
Rules: `name`/`course` 2-100 chars, `email` valid & unique, `age` integer 5-120.

### Sample response
```json
{ "success": true,
  "data": { "id": 1, "name": "Asha Patil", "email": "asha@example.com",
            "course": "Computer Science", "age": 21,
            "created_at": "2026-11-19 10:00:00", "updated_at": "2026-11-19 10:00:00" } }
```

## Deploy on Render (free)
1. Create a GitHub repository and push this folder:
   ```bash
   git init && git add . && git commit -m "Student CRUD API"
   git branch -M main
   git remote add origin https://github.com/<your-username>/student-crud-api.git
   git push -u origin main
   ```
2. Go to https://render.com -> **New +** -> **Web Service** -> connect your GitHub repo.
3. Use these settings (or choose **Blueprint** and Render reads `render.yaml` automatically):
   - Runtime: **Node**
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path: `/health`
   - Instance type: **Free**
4. Click **Create Web Service**. After the build you get a URL like `https://student-crud-api.onrender.com`.
5. Open the URL in a browser - you should see the JSON welcome message.

> **Note:** On Render's free plan the disk is ephemeral and the service sleeps after inactivity (first request may take ~30-60 s). SQLite data resets on restart/redeploy. That is fine for a demo; for permanent data attach a persistent disk (paid) and set `DB_PATH=/var/data/students.db`, or migrate to PostgreSQL.

The same project also works unchanged on Railway, Fly.io, Koyeb, Cyclic-style Node hosts, or any VPS (`npm install && npm start`; the app reads the `PORT` environment variable).

## Test with Postman
1. Open Postman -> **Import** -> choose `postman/Student-CRUD-API.postman_collection.json`.
2. Open the collection -> **Variables** tab -> set `baseUrl` to your deployed URL (or leave `http://localhost:3000` for local testing) -> **Save**.
3. Run requests one by one in order, or click **Run collection** to execute all 9 requests. The create request stores the new `studentId` automatically, and every request has built-in test assertions (green = pass).
4. For your submission, take screenshots of each request/response and the Collection Runner summary.

### Test from the command line (optional)
```bash
npx newman run postman/Student-CRUD-API.postman_collection.json --env-var baseUrl=https://YOUR-APP.onrender.com
```

## Quick curl examples
```bash
curl -X POST $URL/api/students -H "Content-Type: application/json" \
  -d '{"name":"Ravi Kumar","email":"ravi@example.com","course":"MCA","age":24}'
curl $URL/api/students
curl $URL/api/students/1
curl -X PATCH $URL/api/students/1 -H "Content-Type: application/json" -d '{"age":25}'
curl -X DELETE $URL/api/students/1
```

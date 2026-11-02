# CampusHub

CampusHub brings student projects, tasks, skills, certifications, and faculty feedback into one workspace.

## Requirements

- Node.js 18 or newer
- MySQL 8 or compatible

## Backend

Create a MySQL database, then configure `Backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=campushub
JWT_SECRET=use-a-random-secret-at-least-32-characters-long
FRONTEND_URL=http://localhost:5173
```

The API creates the required tables on startup. Start it from the `Backend` directory:

```sh
npm install
npm run dev
```

Student accounts are created through the app. Faculty accounts should be provisioned by a trusted database administrator; after creating an account, assign the faculty role with:

```sql
UPDATE users SET role = 'faculty' WHERE email = 'faculty@university.edu';
```

The API issues JWTs for seven days. Authenticated endpoints require `Authorization: Bearer <token>`. Health check: `GET /api/health`.

## Frontend

Start the app from `Frontend`:

```sh
npm install
npm run dev
```

The frontend calls `http://localhost:5000/api` by default. Set `VITE_API_URL` in `Frontend/.env` to override it, for example `VITE_API_URL=http://localhost:5000/api`.

## Core API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/projects`
- `GET/POST/PUT/DELETE /api/tasks`
- `GET/POST/PUT/DELETE /api/skills`
- `GET/POST/PUT/DELETE /api/certifications`
- `GET/POST /api/projects/:projectId/feedback`

Students can manage only their own records. Faculty can review student projects and submit feedback with an optional grade from 0 to 100.

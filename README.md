# Team Task Manager

A full-stack team task management app with JWT authentication, role-based access control, projects, team membership, task assignment, and status tracking.

## Tech Stack

- Frontend: React, Hooks, Context API, React Router, pure CSS
- Backend: Node.js, Express, JWT, bcrypt
- Database: MongoDB with Mongoose

## Features

- Signup and login with hashed passwords
- JWT-protected backend routes and frontend private routes
- Admin and Member roles
- Admin project creation/deletion and team management
- Admin task creation, assignment, reassignment, and deletion
- Members can view assigned projects and update only their own task status
- Dashboard metrics for total, completed, pending, overdue, and grouped task status
- Responsive sidebar layout with color-coded task statuses

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create backend environment file:

```bash
cp .env.example .env
```

Update `MONGO_URI` and `JWT_SECRET` in `backend/.env`.

3. Start the backend:

```bash
npm run dev
```

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd run dev`. If npm is configured to launch Git Bash and Git Bash fails, use:

```bash
node server.js
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

5. Optional frontend environment file:

```bash
echo VITE_API_URL=http://localhost:5000/api > .env
```

6. Start the frontend:

```bash
npm run dev
```

On Windows, the direct Vite command is:

```bash
node node_modules/vite/bin/vite.js --host 127.0.0.1
```

Open the Vite URL, usually `http://localhost:5173`.

## API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Users

- `GET /api/users/me`
- `GET /api/users` Admin only

### Projects

- `POST /api/projects` Admin only
- `GET /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id` Admin only
- `POST /api/projects/:id/add-member` Admin only
- `POST /api/projects/:id/remove-member` Admin only

### Tasks

- `POST /api/tasks` Admin only
- `GET /api/tasks/project/:projectId`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id` Admin only

## Roles

Admin users can create and delete projects, add and remove members, create tasks, assign or reassign tasks, update tasks, and delete tasks.

Member users can view projects they belong to and update the status of tasks assigned to them.

## Railway Deployment

Deploy this repository as two Railway services because the app is an isolated monorepo.

### Backend Service

Set the Railway service root directory to:

```text
/backend
```

Use these commands:

```bash
npm install
npm start
```

Railway start command:

```bash
npm start
```

Backend variables:

```text
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/team_task_manager?retryWrites=true&w=majority
JWT_SECRET=<long random production secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://<your-frontend-domain>
```

For MongoDB Atlas, copy the connection string from Atlas `Connect -> Drivers`, replace `<password>`, and keep the database name `team_task_manager` before the query string. In Atlas, also add Railway outbound access to `Network Access`; for quick testing you can allow `0.0.0.0/0`, then tighten it later if your plan/network setup supports fixed outbound IPs.

If you use Railway MongoDB later, you can set `MONGO_URI=${{MongoDB.MONGO_URL}}` or `MONGO_URL=${{MongoDB.MONGO_URL}}`; the backend accepts both `MONGO_URI` and `MONGO_URL`.

### Frontend Service

Set the Railway service root directory to:

```text
/frontend
```

Use these commands:

```bash
npm install
npm run build
npm start
```

Railway build command:

```bash
npm run build
```

Railway start command:

```bash
npm start
```

Frontend variables:

```text
VITE_API_URL=https://<your-backend-domain>/api
```

Use the backend service domain only, not the frontend domain. Example:

```text
VITE_API_URL=https://impartial-emotion-production-8ca6.up.railway.app/api
```

After both services are deployed, generate a public domain for each service in Railway. Add the frontend domain to backend `CLIENT_URL`, and add the backend domain plus `/api` to frontend `VITE_API_URL`.

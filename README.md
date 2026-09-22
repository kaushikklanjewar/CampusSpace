# CampusSpace – Classroom & Lab Availability Finder

## 1. Project Title

**CampusSpace** – Classroom & Lab Availability Finder

## 2. Project Description

CampusSpace is a simple web application that helps students and faculty
quickly find which classrooms and computer labs on campus are currently
**Available**, **Occupied**, or under **Maintenance**.

Students use a public **dashboard** to search and filter rooms. Staff use a
lightweight **admin panel** to update a room's status, and the change is
reflected on the dashboard immediately. The project is deliberately kept
simple (no database, no authentication, no frontend framework) so that it
stays easy to read, explain, and extend for a college project / viva.

## 3. Features

- 📊 Live statistics: total, available, occupied, and maintenance counts
- 🔍 Search rooms by name or room ID
- 🧰 Filter by type, building, status, and minimum capacity
- 🗂️ Clean, color-coded room cards with a clear status badge
- 🛠️ Admin panel to change a room's status (no login required, by design)
- 🔗 JSON REST API for rooms (list + single room)
- ❤️ `/health` endpoint reporting app status and build/commit id
- ✅ Server-side validation with proper HTTP status codes (400 / 404)
- 🧪 Automated tests using Node's built-in test runner
- 🐳 Dockerized, production-ready container
- ⚙️ GitHub Actions CI/CD pipeline with lint, test, Docker build, health
  check, and Render deployment

## 4. Technology Stack

| Layer          | Technology                         |
|----------------|-------------------------------------|
| Runtime        | Node.js 20+                        |
| Server         | Express.js                         |
| Frontend       | HTML5, CSS3, Vanilla JavaScript    |
| Data           | In-memory JavaScript array (no DB) |
| Testing        | Node.js built-in test runner (`node:test`) |
| Linting        | ESLint                             |
| Containerizing | Docker                             |
| CI/CD          | GitHub Actions                     |
| Hosting        | Render (Docker Web Service)        |

No React, Next.js, database, authentication library, or external API is
used, by design.

## 5. Project Structure

```
CampusSpace/
├── public/
│   ├── style.css        # All custom CSS (no framework)
│   └── script.js        # Frontend logic for dashboard + admin page
├── views/
│   ├── index.html        # Student dashboard page
│   └── admin.html        # Admin status-management page
├── test/
│   └── app.test.js       # Automated tests (node:test)
├── app.js                 # Express app: routes, data, validation
├── server.js               # Starts the HTTP server (reads PORT)
├── package.json
├── package-lock.json
├── Dockerfile
├── .dockerignore
├── .gitignore
├── eslint.config.js
├── README.md
└── .github/
    └── workflows/
        └── ci-cd.yml       # CI/CD pipeline
```

**Why `app.js` and `server.js` are separate:** `app.js` builds and exports
the Express app (routes + data) but never calls `.listen()`. `server.js`
imports that app and starts it on a port. This lets the automated tests
import the app directly and send it requests without opening a real
network port.

## 6. How to Run Locally

Requires Node.js 20 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm start

# 3. Open in your browser
# Dashboard:    http://localhost:3000
# Admin panel:  http://localhost:3000/admin
```

The port can be overridden with the `PORT` environment variable, e.g.
`PORT=4000 npm start`.

## 7. How to Run Tests

```bash
npm test
```

This runs `node --test` against `test/app.test.js`. The tests spin the
Express app up on a random free port, make real HTTP requests to it with
`fetch`, and shut it down afterwards — no separate server process or
deployment is required.

## 8. How to Run Lint

```bash
npm run lint
```

This runs ESLint (flat config, `eslint.config.js`) over the Node.js source
files (`app.js`, `server.js`, `test/`) and the browser script
(`public/script.js`).

## 9. How to Build/Run with Docker

```bash
# Build the image
docker build -t campusspace .

# Run the container (maps container port 3000 to host port 3000)
docker run -p 3000:3000 campusspace
```

Then open `http://localhost:3000`.

The Dockerfile:
- Uses the lightweight `node:20-alpine` base image
- Installs only production dependencies (`npm install --omit=dev`)
- Runs the app as a non-root user (`appuser`)
- Reads the port from the `PORT` environment variable
- Exposes port `3000`
- Accepts a `GIT_SHA` build argument so CI can bake in the commit id:

```bash
docker build --build-arg GIT_SHA=$(git rev-parse --short HEAD) -t campusspace .
```

## 10. CI/CD Pipeline Explanation

Defined in `.github/workflows/ci-cd.yml`. It has two jobs:

**Job 1 — `build-and-test`** (runs on every push and pull request to `main`)
1. Checkout code
2. Set up Node.js 20
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint`)
5. Run automated tests (`npm test`)
6. Build the Docker image
7. Start the Docker container
8. Run a health check against `/health` (fails the build if it doesn't
   respond with `"status":"ok"`)

**Job 2 — `deploy`** (runs only for pushes to `main`)
- Depends on Job 1 via `needs: build-and-test`, so it only runs if lint,
  tests, the Docker build, and the health check all succeeded
- Triggers a deploy by POSTing to the `RENDER_DEPLOY_HOOK` URL, which is
  stored as a GitHub Actions secret and never hard-coded in the repo

```
Git Push
   ↓
Lint
   ↓
Tests
   ↓
Docker Build
   ↓
Health Check
   ↓
Deploy
   ↓
Live Application
```

If any step before "Deploy" fails, the pipeline stops and no deployment
happens — this is enforced by GitHub Actions' `needs:` dependency between
the two jobs.

## 11. Deployment Explanation

The app is deployed to **Render** as a **Docker Web Service**:

1. Render builds the image from the repository's `Dockerfile`.
2. Render injects the `PORT` environment variable at runtime; the app
   already reads it via `process.env.PORT || 3000`, so no code changes
   are needed for deployment.
3. Render also sets `RENDER_GIT_COMMIT` automatically for each deploy,
   which the app reports on `/health` and in the page footer.
4. A **Deploy Hook URL** is generated in the Render dashboard for the
   service and stored as a GitHub secret named `RENDER_DEPLOY_HOOK`. The
   CI/CD pipeline calls this hook only after a push to `main` passes
   lint, tests, and the Docker health check.

## 12. API Endpoints

| Method | Route              | Description                                   |
|--------|---------------------|------------------------------------------------|
| GET    | `/`                 | Student dashboard (HTML)                       |
| GET    | `/admin`            | Admin status-management page (HTML)             |
| GET    | `/api/rooms`        | Returns all rooms as JSON                       |
| GET    | `/api/rooms/:id`    | Returns a single room as JSON, or `404` if not found |
| POST   | `/admin/update`     | Updates a room's status. Body: `{ "id": "...", "status": "..." }`. Returns `400` for missing/invalid fields or an invalid status, `404` if the room id doesn't exist |
| GET    | `/health`           | Returns `{ "status": "ok", "commit": "..." }` for uptime/CI checks |

**Commit resolution order for `/health` and the footer:**
`RENDER_GIT_COMMIT` → `GIT_SHA` → `"local"`.

## 13. Future Improvements

- Persist room data in a real database (e.g. SQLite or PostgreSQL)
- Add authentication/roles so only staff can access `/admin`
- Add a booking/reservation system with time slots, not just a status
- Add a "last updated" timestamp per room
- Add pagination or virtualization for a much larger room list
- Add end-to-end (browser) tests in addition to the current API tests

---

## Suggested Git Workflow (for progressive commits)

This project is meant to be built through multiple small, meaningful
commits — not a single upload. A suggested history:

1. `chore: initialize project structure and package.json`
2. `feat: add in-memory room data and Express app skeleton`
3. `feat: implement /api/rooms and /api/rooms/:id endpoints`
4. `feat: implement /health endpoint with commit id resolution`
5. `feat: add admin update endpoint with server-side validation`
6. `feat: build dashboard HTML and CSS`
7. `feat: add dashboard search/filter/stat rendering in script.js`
8. `feat: build admin panel HTML and wire up status updates`
9. `test: add automated tests with node:test`
10. `chore: configure ESLint`
11. `chore: add Dockerfile and .dockerignore`
12. `ci: add GitHub Actions workflow for lint/test/build/health-check`
13. `ci: add Render deploy job gated on successful build-and-test`
14. `docs: write README`

A good practice for a feature branch + PR: create a branch such as
`feature/admin-panel`, commit steps 8–9 on it, open a pull request into
`main`, let the CI workflow run (lint + tests + Docker build + health
check), and then merge once it's green.

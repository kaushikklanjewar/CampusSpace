# CampusSpace – Classroom & Lab Availability Finder

## 1. Project Title

**CampusSpace – Classroom & Lab Availability Finder**

## 2. Project Description

CampusSpace is a web application that helps students and faculty quickly find classrooms and computer labs on campus based on their current availability.

The application provides a public dashboard where users can search and filter rooms by floor, type, status, and minimum capacity. A lightweight admin panel allows room statuses to be updated between Available, Occupied, and Maintenance.

The project uses Node.js, Express.js, HTML, CSS, and Vanilla JavaScript. It does not use a database or external APIs, keeping the application simple and suitable for a college project and viva.

## 3. Features

- Live statistics for total, available, occupied, and maintenance spaces
- Search rooms by name or room ID
- Filter by floor
- Filter by room type
- Filter by status
- Filter by minimum capacity
- Combined filtering using multiple filters
- Clear Filters functionality
- Dynamic statistics based on filtered results
- Color-coded room status badges
- Admin panel for updating room status
- JSON REST API for room information
- `/health` endpoint for application and deployment health checks
- Server-side validation with proper HTTP status codes
- Automated tests using Node.js built-in test runner
- ESLint code quality checking
- Docker support
- GitHub Actions CI/CD pipeline
- Automatic deployment to Render
- Running commit ID displayed in the application footer

## 4. Room Structure

CampusSpace contains exactly **24 spaces across 4 floors**.

Each floor contains:

- 4 Classrooms
- 2 Computer Labs
- 6 spaces total

### Floor 1

- CR-101
- CR-102
- CR-103
- CR-104
- LAB-101
- LAB-102

### Floor 2

- CR-201
- CR-202
- CR-203
- CR-204
- LAB-201
- LAB-202

### Floor 3

- CR-301
- CR-302
- CR-303
- CR-304
- LAB-301
- LAB-302

### Floor 4

- CR-401
- CR-402
- CR-403
- CR-404
- LAB-401
- LAB-402

**Total:**
- 16 Classrooms
- 8 Computer Labs
- 24 Spaces
- 4 Floors
- Building: Main Academic Block

Room capacities range from 30 to 80.

Room statuses are:

- Available
- Occupied
- Maintenance

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Server | Express.js |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Data | In-memory JavaScript array |
| Testing | Node.js built-in test runner (`node:test`) |
| Linting | ESLint |
| Containerization | Docker |
| CI/CD | GitHub Actions |
| Hosting | Render Docker Web Service |

No React, Next.js, database, authentication library, or external API is used.

## 6. Project Structure

```text
CampusSpace/
├── public/
│   ├── style.css
│   └── script.js
├── views/
│   ├── index.html
│   └── admin.html
├── test/
│   └── app.test.js
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── Dockerfile
├── .dockerignore
├── .gitignore
├── eslint.config.js
├── README.md
└── .github/
    └── workflows/
        └── ci-cd.yml
/**
 * app.js
 * ----------------------------------------------------------------------
 * CampusSpace - Classroom & Lab Availability Finder
 *
 * This file creates and configures the Express application:
 *   - in-memory sample data (rooms)
 *   - page routes (dashboard + admin)
 *   - JSON API routes
 *   - a health check route
 *
 * The app is exported (not started) so that it can be reused by both
 * server.js (to actually listen on a port) and by the automated tests
 * (which can send requests to it directly without opening a port).
 * ----------------------------------------------------------------------
 */

const path = require('node:path');
const express = require('express');

const app = express();

// Allow the app to read JSON and form-encoded bodies (used by /admin/update)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets (style.css, script.js) from /public
app.use(express.static(path.join(__dirname, 'public')));

/**
 * ------------------------------------------------------------------
 * In-memory data
 * ------------------------------------------------------------------
 * In a real system this would live in a database. For this project we
 * keep everything in a simple array so the logic stays easy to read
 * and explain. The array is mutated directly when the admin updates a
 * room's status, so changes are reflected immediately on the dashboard.
 */
const VALID_TYPES = ['Classroom', 'Computer Lab'];
const VALID_STATUSES = ['Available', 'Occupied', 'Maintenance'];

const BUILDING = 'Main Academic Block';

const rooms = [
  // Floor 1
  { id: 'CR-101', name: 'Room 101', type: 'Classroom', building: BUILDING, floor: 1, capacity: 60, status: 'Available' },
  { id: 'CR-102', name: 'Room 102', type: 'Classroom', building: BUILDING, floor: 1, capacity: 45, status: 'Occupied' },
  { id: 'CR-103', name: 'Room 103', type: 'Classroom', building: BUILDING, floor: 1, capacity: 70, status: 'Available' },
  { id: 'CR-104', name: 'Room 104', type: 'Classroom', building: BUILDING, floor: 1, capacity: 50, status: 'Maintenance' },
  { id: 'LAB-101', name: 'Computer Lab 101', type: 'Computer Lab', building: BUILDING, floor: 1, capacity: 40, status: 'Available' },
  { id: 'LAB-102', name: 'Computer Lab 102', type: 'Computer Lab', building: BUILDING, floor: 1, capacity: 35, status: 'Occupied' },

  // Floor 2
  { id: 'CR-201', name: 'Room 201', type: 'Classroom', building: BUILDING, floor: 2, capacity: 70, status: 'Available' },
  { id: 'CR-202', name: 'Room 202', type: 'Classroom', building: BUILDING, floor: 2, capacity: 50, status: 'Maintenance' },
  { id: 'CR-203', name: 'Room 203', type: 'Classroom', building: BUILDING, floor: 2, capacity: 65, status: 'Occupied' },
  { id: 'CR-204', name: 'Room 204', type: 'Classroom', building: BUILDING, floor: 2, capacity: 40, status: 'Available' },
  { id: 'LAB-201', name: 'Computer Lab 201', type: 'Computer Lab', building: BUILDING, floor: 2, capacity: 35, status: 'Occupied' },
  { id: 'LAB-202', name: 'Computer Lab 202', type: 'Computer Lab', building: BUILDING, floor: 2, capacity: 30, status: 'Available' },

  // Floor 3
  { id: 'CR-301', name: 'Room 301', type: 'Classroom', building: BUILDING, floor: 3, capacity: 80, status: 'Occupied' },
  { id: 'CR-302', name: 'Room 302', type: 'Classroom', building: BUILDING, floor: 3, capacity: 55, status: 'Available' },
  { id: 'CR-303', name: 'Room 303', type: 'Classroom', building: BUILDING, floor: 3, capacity: 60, status: 'Maintenance' },
  { id: 'CR-304', name: 'Room 304', type: 'Classroom', building: BUILDING, floor: 3, capacity: 45, status: 'Available' },
  { id: 'LAB-301', name: 'Computer Lab 301', type: 'Computer Lab', building: BUILDING, floor: 3, capacity: 30, status: 'Maintenance' },
  { id: 'LAB-302', name: 'Computer Lab 302', type: 'Computer Lab', building: BUILDING, floor: 3, capacity: 40, status: 'Occupied' },

  // Floor 4
  { id: 'CR-401', name: 'Room 401', type: 'Classroom', building: BUILDING, floor: 4, capacity: 65, status: 'Maintenance' },
  { id: 'CR-402', name: 'Room 402', type: 'Classroom', building: BUILDING, floor: 4, capacity: 40, status: 'Available' },
  { id: 'CR-403', name: 'Room 403', type: 'Classroom', building: BUILDING, floor: 4, capacity: 75, status: 'Occupied' },
  { id: 'CR-404', name: 'Room 404', type: 'Classroom', building: BUILDING, floor: 4, capacity: 50, status: 'Available' },
  { id: 'LAB-401', name: 'Computer Lab 401', type: 'Computer Lab', building: BUILDING, floor: 4, capacity: 45, status: 'Occupied' },
  { id: 'LAB-402', name: 'Computer Lab 402', type: 'Computer Lab', building: BUILDING, floor: 4, capacity: 30, status: 'Available' },
];

/**
 * ------------------------------------------------------------------
 * Helper functions
 * ------------------------------------------------------------------
 */

// Returns the room object matching an id, or undefined if not found.
function findRoomById(id) {
  return rooms.find((room) => room.id === id);
}

// Resolves the current git commit to show on /health and in the footer.
function getCommitId() {
  return process.env.RENDER_GIT_COMMIT || process.env.GIT_SHA || 'local';
}

/**
 * ------------------------------------------------------------------
 * Page routes
 * ------------------------------------------------------------------
 */

// GET / -> main student dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// GET /admin -> admin status-management page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

/**
 * ------------------------------------------------------------------
 * JSON API routes
 * ------------------------------------------------------------------
 */

// GET /api/rooms -> list all rooms
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// GET /api/rooms/:id -> a single room
app.get('/api/rooms/:id', (req, res) => {
  const room = findRoomById(req.params.id);

  if (!room) {
    return res.status(404).json({ error: `Room with id "${req.params.id}" was not found.` });
  }

  return res.json(room);
});

// POST /admin/update -> update a room's status (used by the admin panel form)
app.post('/admin/update', (req, res) => {
  const { id, status } = req.body;

  // Validate: required fields present
  if (!id || !status) {
    return res.status(400).json({ error: 'Both "id" and "status" are required.' });
  }

  // Validate: status must be one of the known values
  if (!VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(', ')}.` });
  }

  // Validate: room must exist
  const room = findRoomById(id);
  if (!room) {
    return res.status(404).json({ error: `Room with id "${id}" was not found.` });
  }

  // All good — apply the update
  room.status = status;

  return res.status(200).json({ message: 'Room status updated successfully.', room });
});

/**
 * ------------------------------------------------------------------
 * Health check
 * ------------------------------------------------------------------
 */

// GET /health -> used by Docker/CI/Render to confirm the app is alive
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', commit: getCommitId() });
});

// Export constants too, so the test suite can reuse them without duplicating values.
module.exports = { app, rooms, VALID_TYPES, VALID_STATUSES, getCommitId };

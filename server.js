/**
 * server.js
 * ----------------------------------------------------------------------
 * Starts the CampusSpace Express app.
 *
 * This file is kept separate from app.js on purpose:
 *   - app.js defines the application (routes, data, logic)
 *   - server.js only starts the HTTP server
 *
 * This separation lets the automated tests import the app directly
 * from app.js without opening a real network port.
 * ----------------------------------------------------------------------
 */

const { app } = require('./app');

// Render (and most hosting platforms) provide the port via an
// environment variable. Fall back to 3000 for local development.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CampusSpace server is running on port ${PORT}`);
});

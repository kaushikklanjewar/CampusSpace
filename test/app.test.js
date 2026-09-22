/**
 * test/app.test.js
 * ----------------------------------------------------------------------
 * Automated tests for CampusSpace using Node.js's built-in test runner
 * (node:test) and assert module. No external testing library is used.
 *
 * The tests start the Express app on an ephemeral port (port 0 lets the
 * OS pick a free one) before all tests run, and close it afterwards.
 * ----------------------------------------------------------------------
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { app, rooms } = require('../app');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://localhost:${port}`;
});

test.after(() => {
  server.close();
});

test('GET /health returns 200 and status "ok"', async () => {
  const res = await fetch(`${baseUrl}/health`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.status, 'ok');
  assert.ok('commit' in body);
});

test('GET /api/rooms returns the full list of rooms', async () => {
  const res = await fetch(`${baseUrl}/api/rooms`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body));
  assert.equal(body.length, rooms.length);
  assert.ok(body.length >= 12, 'expected at least 12 sample rooms');
});

test('GET /api/rooms/:id returns a valid room', async () => {
  const knownId = rooms[0].id;
  const res = await fetch(`${baseUrl}/api/rooms/${knownId}`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.id, knownId);
});

test('GET /api/rooms/:id returns 404 for an unknown room id', async () => {
  const res = await fetch(`${baseUrl}/api/rooms/DOES-NOT-EXIST`);
  const body = await res.json();

  assert.equal(res.status, 404);
  assert.ok(body.error);
});

test('POST /admin/update succeeds for a valid room and status', async () => {
  const target = rooms[0];

  const res = await fetch(`${baseUrl}/admin/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: target.id, status: 'Maintenance' }),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.room.status, 'Maintenance');

  // Confirm the change is actually reflected via the GET endpoint too.
  const getRes = await fetch(`${baseUrl}/api/rooms/${target.id}`);
  const getBody = await getRes.json();
  assert.equal(getBody.status, 'Maintenance');
});

test('POST /admin/update rejects an invalid status value', async () => {
  const target = rooms[0];

  const res = await fetch(`${baseUrl}/admin/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: target.id, status: 'OnFire' }),
  });
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.ok(body.error);
});

test('POST /admin/update rejects an unknown room id', async () => {
  const res = await fetch(`${baseUrl}/admin/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'NOT-A-REAL-ROOM', status: 'Available' }),
  });
  const body = await res.json();

  assert.equal(res.status, 404);
  assert.ok(body.error);
});

test('POST /admin/update rejects a missing status value', async () => {
  const target = rooms[0];

  const res = await fetch(`${baseUrl}/admin/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: target.id }),
  });
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.ok(body.error);
});

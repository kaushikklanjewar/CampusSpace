/**
 * script.js
 * ----------------------------------------------------------------------
 * Vanilla JS for CampusSpace. This single file powers both the
 * dashboard (index.html) and the admin panel (admin.html). Each page
 * only has the DOM elements it needs, so the functions below check
 * whether an element exists before using it.
 * ----------------------------------------------------------------------
 */

// Keep a local copy of the rooms fetched from the API so filtering/search
// can be done instantly in the browser without extra network requests.
let allRooms = [];

/* ==========================================================================
   Shared helpers
   ========================================================================== */

async function fetchRooms() {
  const response = await fetch('/api/rooms');
  return response.json();
}

async function fetchCommitId() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    return data.commit;
  } catch {
    return 'local';
  }
}

function statusToClass(status) {
  return `status-${status.toLowerCase()}`;
}

// Small emoji indicator shown next to the status text on badges, so the
// status is recognizable at a glance even before reading the label.
function statusEmoji(status) {
  const emojis = { Available: '🟢', Occupied: '🔴', Maintenance: '🟡' };
  return emojis[status] || '';
}

async function renderFooterCommit() {
  const el = document.getElementById('commit-id');
  if (!el) return;
  el.textContent = await fetchCommitId();
}

/* ==========================================================================
   Dashboard page (index.html)
   ========================================================================== */

// Renders the four statistics cards from whatever room list is passed in.
// The dashboard calls this with the *filtered* list so the numbers always
// reflect what's currently on screen.
function updateStats(rooms) {
  document.getElementById('stat-total').textContent = rooms.length;
  document.getElementById('stat-available').textContent =
    rooms.filter((r) => r.status === 'Available').length;
  document.getElementById('stat-occupied').textContent =
    rooms.filter((r) => r.status === 'Occupied').length;
  document.getElementById('stat-maintenance').textContent =
    rooms.filter((r) => r.status === 'Maintenance').length;
}

function createRoomCard(room) {
  const card = document.createElement('article');
  card.className = 'room-card';

  card.innerHTML = `
    <div class="room-card-header">
      <div>
        <p class="room-name">${room.name}</p>
        <p class="room-id">${room.id}</p>
      </div>
      <span class="status-badge ${statusToClass(room.status)}">${statusEmoji(room.status)} ${room.status}</span>
    </div>
    <span class="room-type-tag">${room.type}</span>
    <div class="room-details">
      <p><strong>Building:</strong> ${room.building}</p>
      <p><strong>Floor:</strong> ${room.floor}</p>
      <p><strong>Capacity:</strong> ${room.capacity}</p>
    </div>
  `;

  return card;
}

function getActiveFilters() {
  return {
    search: document.getElementById('search-input').value.trim().toLowerCase(),
    floor: document.getElementById('filter-floor').value,
    type: document.getElementById('filter-type').value,
    status: document.getElementById('filter-status').value,
    minCapacity: Number(document.getElementById('filter-capacity').value) || 0,
  };
}

// Applies every active filter (search + floor + type + status + capacity)
// together, so combinations like "Floor 2 + Computer Lab + Available + 40+"
// all narrow the same list down at once.
function applyFilters() {
  const { search, floor, type, status, minCapacity } = getActiveFilters();

  return allRooms.filter((room) => {
    const matchesSearch =
      !search ||
      room.name.toLowerCase().includes(search) ||
      room.id.toLowerCase().includes(search);

    const matchesFloor = floor === 'All' || String(room.floor) === floor;
    const matchesType = type === 'All' || room.type === type;
    const matchesStatus = status === 'All' || room.status === status;
    const matchesCapacity = room.capacity >= minCapacity;

    return matchesSearch && matchesFloor && matchesType && matchesStatus && matchesCapacity;
  });
}

// Re-runs filtering and redraws both the room grid and the statistics
// cards, so the stats always describe what's currently visible.
function renderRoomGrid() {
  const grid = document.getElementById('room-grid');
  const emptyState = document.getElementById('empty-state');
  const filtered = applyFilters();

  updateStats(filtered);
  grid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  filtered.forEach((room) => grid.appendChild(createRoomCard(room)));
}

function initDashboardControls() {
  const ids = ['search-input', 'filter-floor', 'filter-type', 'filter-status', 'filter-capacity'];
  ids.forEach((id) => {
    document.getElementById(id).addEventListener('input', renderRoomGrid);
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-floor').value = 'All';
    document.getElementById('filter-type').value = 'All';
    document.getElementById('filter-status').value = 'All';
    document.getElementById('filter-capacity').value = '0';
    renderRoomGrid();
  });
}

async function initDashboardPage() {
  allRooms = await fetchRooms();
  renderRoomGrid();
  initDashboardControls();
}

/* ==========================================================================
   Admin page (admin.html)
   ========================================================================== */

function populateRoomSelect(rooms) {
  const select = document.getElementById('room-select');
  select.innerHTML = '';

  rooms.forEach((room) => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = `${room.id} — ${room.name} (${room.building})`;
    select.appendChild(option);
  });
}

function renderAdminTable(rooms) {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';

  rooms.forEach((room) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${room.id}</td>
      <td>${room.name}</td>
      <td>${room.type}</td>
      <td>${room.building}</td>
      <td>${room.floor}</td>
      <td>${room.capacity}</td>
      <td><span class="status-badge ${statusToClass(room.status)}">${statusEmoji(room.status)} ${room.status}</span></td>
    `;
    tbody.appendChild(row);
  });
}

function showFormMessage(message, isSuccess) {
  const el = document.getElementById('form-message');
  el.textContent = message;
  el.className = `form-message ${isSuccess ? 'success' : 'error'}`;
}

async function refreshAdminData() {
  allRooms = await fetchRooms();
  populateRoomSelect(allRooms);
  renderAdminTable(allRooms);
}

function initAdminForm() {
  const form = document.getElementById('update-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('room-select').value;
    const status = document.getElementById('status-select').value;

    try {
      const response = await fetch('/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        showFormMessage(data.error || 'Something went wrong.', false);
        return;
      }

      showFormMessage(`"${data.room.name}" is now marked as ${data.room.status}.`, true);
      await refreshAdminData();
    } catch {
      showFormMessage('Could not reach the server. Please try again.', false);
    }
  });
}

async function initAdminPage() {
  await refreshAdminData();
  initAdminForm();
}

/* ==========================================================================
   Entry point
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderFooterCommit();

  if (document.getElementById('room-grid')) {
    initDashboardPage();
  }

  if (document.getElementById('update-form')) {
    initAdminPage();
  }
});

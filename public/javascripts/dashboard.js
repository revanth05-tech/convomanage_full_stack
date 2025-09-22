let conferences = [];
let attendees = [];
let speakers = [];
let sessions = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchConferences();
    fetchAttendees();
    fetchSpeakers();
    fetchSessions();
    updateDashboard();
    setupDeleteListeners();
});

// ---------------- FETCH FUNCTIONS ----------------
async function fetchConferences() {
    try {
        const response = await fetch('/api/conferences');
        if (!response.ok) throw new Error('Network response was not ok');
        conferences = await response.json();
        updateConferencesTable();
        populateDropdowns();
        updateDashboard();
    } catch (error) {
        handleFetchError(error, 'conferences');
    }
}

async function fetchAttendees() {
    try {
        const response = await fetch('/api/attendees');
        if (!response.ok) throw new Error('Network response was not ok');
        attendees = await response.json();
        updateAttendeesTable();
        updateDashboard();
    } catch (error) {
        handleFetchError(error, 'attendees');
    }
}

async function fetchSpeakers() {
    try {
        const response = await fetch('/api/speakers');
        if (!response.ok) throw new Error('Network response was not ok');
        speakers = await response.json();
        updateSpeakersTable();
        populateDropdowns();
        updateDashboard();
    } catch (error) {
        handleFetchError(error, 'speakers');
    }
}

async function fetchSessions() {
    try {
        const response = await fetch('/api/sessions');
        if (!response.ok) throw new Error('Network response was not ok');
        sessions = await response.json();
        updateSessionsTable();
        updateDashboard();
    } catch (error) {
        handleFetchError(error, 'sessions');
    }
}

// ---------------- FORM SUBMISSIONS ----------------
async function handleFormSubmit(formId, apiPath, fetchFunction, alertId, successMsg, errorMsg) {
    const form = document.getElementById(formId);
    form?.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const formData = new FormData(this);
            const response = await fetch(apiPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            await fetchFunction();
            this.reset();
            showAlert(alertId, 'success', successMsg);
        } catch (error) {
            showAlert(alertId, 'error', errorMsg);
            console.error('Error:', error);
        }
    });
}

handleFormSubmit('attendeeForm', '/api/attendees', fetchAttendees, 'attendeeAlert', 'Attendee added successfully!', 'Failed to add attendee.');
handleFormSubmit('speakerForm', '/api/speakers', fetchSpeakers, 'speakerAlert', 'Speaker added successfully!', 'Failed to add speaker.');
handleFormSubmit('sessionForm', '/api/sessions', fetchSessions, 'sessionAlert', 'Session added successfully!', 'Failed to add session.');
handleFormSubmit('conferenceForm', '/api/conferences', fetchConferences, 'conferenceAlert', 'Conference added successfully!', 'Failed to add conference.');

// ---------------- DELETE FUNCTIONS (GLOBAL) ----------------
async function deleteAttendee(id) {
    if (!confirm('Are you sure you want to delete this attendee?')) return;
    try {
        const response = await fetch(`/api/attendees/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchAttendees();
        showAlert('attendeeAlert', 'success', 'Attendee deleted successfully!');
    } catch (error) {
        showAlert('attendeeAlert', 'error', 'Failed to delete attendee.');
        console.error(error);
    }
}

async function deleteSpeaker(id) {
    if (!confirm('Are you sure you want to delete this speaker?')) return;
    try {
        const response = await fetch(`/api/speakers/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchSpeakers();
        showAlert('speakerAlert', 'success', 'Speaker deleted successfully!');
    } catch (error) {
        showAlert('speakerAlert', 'error', 'Failed to delete speaker.');
        console.error(error);
    }
}

async function deleteSession(id) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
        const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchSessions();
        showAlert('sessionAlert', 'success', 'Session deleted successfully!');
    } catch (error) {
        showAlert('sessionAlert', 'error', 'Failed to delete session.');
        console.error(error);
    }
}

async function deleteConference(id) {
    if (!confirm('Are you sure you want to delete this conference?')) return;
    try {
        const response = await fetch(`/api/conferences/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchConferences();
        showAlert('conferenceAlert', 'success', 'Conference deleted successfully!');
    } catch (error) {
        showAlert('conferenceAlert', 'error', 'Failed to delete conference.');
        console.error(error);
    }
}

// ---------------- HELPER FUNCTIONS ----------------
function populateDropdowns() {
    document.querySelectorAll('.conference-select').forEach(select => {
        select.innerHTML = `<option value="">Select Conference</option>${conferences.map(c => `<option value="${c._id}">${c.name}</option>`).join('')}`;
    });
    document.querySelectorAll('.speaker-select').forEach(select => {
        select.innerHTML = `<option value="">Select Speaker</option>${speakers.map(s => `<option value="${s._id}">${s.name}</option>`).join('')}`;
    });
}

function showAlert(containerId, type, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    container.innerHTML = '';
    container.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function handleFetchError(error, entity) {
    console.error(`Error fetching ${entity}:`, error);
    showAlert(`${entity}Alert`, 'error', `Failed to load ${entity}. Please try again.`);
}

// ---------------- UPDATE DASHBOARD ----------------
function updateDashboard() {
    document.getElementById('totalAttendees')?.textContent = attendees.length;
    document.getElementById('totalSpeakers')?.textContent = speakers.length;
    document.getElementById('totalSessions')?.textContent = sessions.length;
    document.getElementById('totalConferences')?.textContent = conferences.length;
    document.getElementById('totalRevenue')?.textContent = `$${calculateTotalRevenue()}`;
    document.getElementById('registrationRate')?.textContent = `${calculateRegistrationRate()}%`;
}

function calculateTotalRevenue() {
    const attendeeRevenue = attendees.reduce((total, a) => {
        const ticketPrice = a.ticketType === 'vip' ? 500 : a.ticketType === 'premium' ? 250 : 100;
        return total + ticketPrice;
    }, 0);
    const speakerFees = speakers.reduce((total, s) => total + (parseFloat(s.fee) || 0), 0);
    return (attendeeRevenue - speakerFees).toLocaleString();
}

function calculateRegistrationRate() {
    const totalCapacity = conferences.reduce((total, c) => total + (parseInt(c.capacity) || 0), 0);
    if (totalCapacity === 0) return 0;
    return Math.round((attendees.length / totalCapacity) * 100);
}

// ---------------- TABLE UPDATES ----------------
function updateAttendeesTable() {
    const tbody = document.getElementById('attendeesTableBody');
    if (!tbody) return;
    tbody.innerHTML = attendees.map(a => `
        <tr>
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td>${a.company || 'N/A'}</td>
            <td>${conferences.find(c => c._id === a.conference)?.name || 'N/A'}</td>
            <td>${a.ticketType}</td>
            <td><span class="status-badge status-${a.status}">${a.status}</span></td>
            <td><button class="btn btn-danger delete-btn" data-id="${a._id}" data-type="attendee">Delete</button></td>
        </tr>
    `).join('');
}

function updateSpeakersTable() {
    const tbody = document.getElementById('speakersTableBody');
    if (!tbody) return;
    tbody.innerHTML = speakers.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.company || 'N/A'}</td>
            <td>${s.expertise}</td>
            <td>$${s.fee}</td>
            <td><button class="btn btn-danger delete-btn" data-id="${s._id}" data-type="speaker">Delete</button></td>
        </tr>
    `).join('');
}

function updateSessionsTable() {
    const tbody = document.getElementById('sessionsTableBody');
    if (!tbody) return;
    tbody.innerHTML = sessions.map(s => `
        <tr>
            <td>${s.title}</td>
            <td>${speakers.find(sp => sp._id === s.speaker)?.name || 'N/A'}</td>
            <td>${conferences.find(c => c._id === s.conference)?.name || 'N/A'}</td>
            <td>${s.date}</td>
            <td>${s.startTime}</td>
            <td>${s.duration} min</td>
            <td><button class="btn btn-danger delete-btn" data-id="${s._id}" data-type="session">Delete</button></td>
        </tr>
    `).join('');
}

function updateConferencesTable() {
    const tbody = document.getElementById('conferencesTableBody');
    if (!tbody) return;
    tbody.innerHTML = conferences.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.type}</td>
            <td>${c.startDate}</td>
            <td>${c.endDate}</td>
            <td>${c.capacity}</td>
            <td>${attendees.filter(a => a.conference === c._id).length}</td>
            <td><span class="status-badge status-${c.status}">${c.status}</span></td>
            <td><button class="btn btn-danger delete-btn" data-id="${c._id}" data-type="conference">Delete</button></td>
        </tr>
    `).join('');
}

// ---------------- DELETE EVENT DELEGATION ----------------
function setupDeleteListeners() {
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            const type = e.target.dataset.type;
            if (type === 'attendee') await deleteAttendee(id);
            else if (type === 'speaker') await deleteSpeaker(id);
            else if (type === 'session') await deleteSession(id);
            else if (type === 'conference') await deleteConference(id);
        }
    });
}

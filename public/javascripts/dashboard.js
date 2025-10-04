// -------------------- API Endpoints --------------------
const API_ENDPOINTS = {
    attendees: '/api/attendees',
    speakers: '/api/speakers',
    sessions: '/api/sessions',
    conferences: '/api/conferences'
};
// Add this function at the top after API_ENDPOINTS
function showDashboard(section) {
    // Hide all dashboards
    document.querySelectorAll('.dashboard').forEach(dash => {
        dash.classList.remove('active');
    });
    
    // Show selected dashboard
    document.getElementById(section).classList.add('active');
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showDashboard('${section}')"]`).classList.add('active');
}
// -------------------- Data Storage --------------------
let conferences = [];
let attendees = [];
let speakers = [];
let sessions = [];

// -------------------- API Helper --------------------
async function handleApiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// -------------------- Fetch Functions --------------------
async function fetchConferences() {
    conferences = await handleApiRequest(API_ENDPOINTS.conferences);
}
async function fetchAttendees() {
    attendees = await handleApiRequest(API_ENDPOINTS.attendees);
}
async function fetchSpeakers() {
    speakers = await handleApiRequest(API_ENDPOINTS.speakers);
}
async function fetchSessions() {
    sessions = await handleApiRequest(API_ENDPOINTS.sessions);
}

// -------------------- Update All Data --------------------
async function updateAllData() {
    await Promise.all([
        fetchConferences(),
        fetchAttendees(),
        fetchSpeakers(),
        fetchSessions()
    ]);
    updateDashboard();
    populateDropdowns();
    updateTables();
}

// -------------------- Init App --------------------
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await updateAllData();
        setupFormHandlers();
    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('attendeeAlert', 'error', 'Failed to load initial data');
    }
});

// -------------------- Generic Form Submission --------------------
async function handleFormSubmission(formId, endpoint, successMessage) {
    const form = document.getElementById(formId);
    const submitButton = form.querySelector('button[type="submit"]');
    
    try {
        submitButton.disabled = true;
        form.classList.add('loading');
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        await handleApiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        showAlert(`${formId}Alert`, 'success', successMessage);
        form.reset();
        await updateAllData();
    } catch (error) {
        showAlert(`${formId}Alert`, 'error', error.message);
    } finally {
        submitButton.disabled = false;
        form.classList.remove('loading');
    }
}

// -------------------- Setup Form Handlers --------------------
function setupFormHandlers() {
    const forms = {
        attendeeForm: API_ENDPOINTS.attendees,
        speakerForm: API_ENDPOINTS.speakers,
        sessionForm: API_ENDPOINTS.sessions,
        conferenceForm: API_ENDPOINTS.conferences
    };

    Object.entries(forms).forEach(([formId, endpoint]) => {
        document.getElementById(formId).addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmission(
                formId, 
                endpoint, 
                `${formId.replace('Form', '')} added successfully!`
            );
        });
    });
}

// -------------------- Dashboard Functions --------------------
function updateDashboard() {
    document.getElementById('totalAttendees').textContent = attendees.length;
    document.getElementById('totalSpeakers').textContent = speakers.length;
    document.getElementById('totalSessions').textContent = sessions.length;
    document.getElementById('totalConferences').textContent = conferences.length;

    const confirmedAttendees = attendees.filter(a => a.status === 'confirmed').length;
    const registrationRate = attendees.length > 0 ? Math.round((confirmedAttendees / attendees.length) * 100) : 0;
    document.getElementById('registrationRate').textContent = registrationRate + '%';

    const revenue = attendees.reduce((total, attendee) => {
        const prices = { standard: 299, premium: 499, vip: 799 };
        return total + (prices[attendee.ticketType] || 0);
    }, 0);
    document.getElementById('totalRevenue').textContent = `$${revenue.toLocaleString()}`;

    document.getElementById('avgRating').textContent = '4.7';
    document.getElementById('totalCountries').textContent = '15';

    updateAnalyticsTable();
}

function populateDropdowns() {
    const conferenceSelects = ['attendeeConference', 'sessionConference'];
    conferenceSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Conference</option>';
        conferences.forEach(conf => {
            select.innerHTML += `<option value="${conf.id}">${conf.name}</option>`;
        });
    });

    const speakerSelect = document.getElementById('sessionSpeaker');
    speakerSelect.innerHTML = '<option value="">Select Speaker</option>';
    speakers.forEach(speaker => {
        speakerSelect.innerHTML += `<option value="${speaker.id}">${speaker.name}</option>`;
    });
}

function showAlert(containerId, type, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// -------------------- Tables --------------------
function updateTables() {
    updateAttendeesTable();
    updateSpeakersTable();
    updateSessionsTable();
    updateConferencesTable();
}

function updateAttendeesTable() {
    const tbody = document.getElementById('attendeesTableBody');
    tbody.innerHTML = '';

    attendees.forEach(attendee => {
        const conference = conferences.find(c => c.id === attendee.conference);
        const row = `
            <tr>
                <td>${attendee.name}</td>
                <td>${attendee.email}</td>
                <td>${attendee.company || 'N/A'}</td>
                <td>${conference ? conference.name : 'N/A'}</td>
                <td>${attendee.ticketType?.toUpperCase() || 'N/A'}</td>
                <td><span class="status-badge status-${attendee.status}">${attendee.status}</span></td>
                <td><button class="btn btn-danger" onclick="deleteAttendee(${attendee.id})">Delete</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateSpeakersTable() {
    const tbody = document.getElementById('speakersTableBody');
    tbody.innerHTML = '';

    speakers.forEach(speaker => {
        const row = `
            <tr>
                <td>${speaker.name}</td>
                <td>${speaker.email}</td>
                <td>${speaker.company || 'N/A'}</td>
                <td>${speaker.expertise || 'N/A'}</td>
                <td>${speaker.fee?.toLocaleString() || 0}</td>
                <td><button class="btn btn-danger" onclick="deleteSpeaker(${speaker.id})">Delete</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateSessionsTable() {
    const tbody = document.getElementById('sessionsTableBody');
    tbody.innerHTML = '';

    sessions.forEach(session => {
        const speaker = speakers.find(s => s.id === session.speaker);
        const conference = conferences.find(c => c.id === session.conference);
        const row = `
            <tr>
                <td>${session.title}</td>
                <td>${speaker ? speaker.name : 'N/A'}</td>
                <td>${conference ? conference.name : 'N/A'}</td>
                <td>${session.date}</td>
                <td>${session.startTime}</td>
                <td>${session.duration} min</td>
                <td><button class="btn btn-danger" onclick="deleteSession(${session.id})">Delete</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateConferencesTable() {
    const tbody = document.getElementById('conferencesTableBody');
    tbody.innerHTML = '';

    conferences.forEach(conference => {
        const registeredCount = attendees.filter(a => a.conference === conference.id).length;
        const row = `
            <tr>
                <td>${conference.name}</td>
                <td>${conference.type?.toUpperCase() || 'N/A'}</td>
                <td>${conference.startDate}</td>
                <td>${conference.endDate}</td>
                <td>${conference.capacity}</td>
                <td>${registeredCount}</td>
                <td><span class="status-badge status-${conference.status}">${conference.status}</span></td>
                <td><button class="btn btn-danger" onclick="deleteConference(${conference.id})">Delete</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateAnalyticsTable() {
    const tbody = document.getElementById('analyticsTableBody');
    tbody.innerHTML = '';

    conferences.forEach(conference => {
        const conferenceAttendees = attendees.filter(a => a.conference === conference.id);
        const conferenceSessions = sessions.filter(s => s.conference === conference.id);
        const completionRate = Math.floor(Math.random() * 30) + 70; 
        const revenue = conferenceAttendees.reduce((total, attendee) => {
            const prices = { standard: 299, premium: 499, vip: 799 };
            return total + (prices[attendee.ticketType] || 0);
        }, 0);
        const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

        const row = `
            <tr>
                <td>${conference.name}</td>
                <td>${conferenceAttendees.length}</td>
                <td>${conferenceSessions.length}</td>
                <td>${completionRate}%</td>
                <td>${revenue.toLocaleString()}</td>
                <td>${rating}⭐</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// -------------------- Delete with API --------------------
async function deleteAttendee(id) {
    if (confirm('Delete this attendee?')) {
        await handleApiRequest(`${API_ENDPOINTS.attendees}/${id}`, { method: 'DELETE' });
        await updateAllData();
    }
}
async function deleteSpeaker(id) {
    if (confirm('Delete this speaker?')) {
        await handleApiRequest(`${API_ENDPOINTS.speakers}/${id}`, { method: 'DELETE' });
        await updateAllData();
    }
}
async function deleteSession(id) {
    if (confirm('Delete this session?')) {
        await handleApiRequest(`${API_ENDPOINTS.sessions}/${id}`, { method: 'DELETE' });
        await updateAllData();
    }
}
async function deleteConference(id) {
    if (confirm('Delete this conference and all its related data?')) {
        await handleApiRequest(`${API_ENDPOINTS.conferences}/${id}`, { method: 'DELETE' });
        await updateAllData();
    }
}

// -------------------- Filters --------------------
function filterAttendees() {
    const searchTerm = document.getElementById('attendeeSearch').value.toLowerCase();
    const statusFilter = document.getElementById('attendeeStatusFilter').value;
    const rows = document.querySelectorAll('#attendeesTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.querySelector('.status-badge').textContent;
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = !statusFilter || status === statusFilter;
        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

function filterSpeakers() {
    const searchTerm = document.getElementById('speakerSearch').value.toLowerCase();
    document.querySelectorAll('#speakersTableBody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
    });
}

function filterSessions() {
    const searchTerm = document.getElementById('sessionSearch').value.toLowerCase();
    const dateFilter = document.getElementById('sessionDateFilter').value;
    document.querySelectorAll('#sessionsTableBody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        const dateCell = row.children[3].textContent;
        const matchesSearch = text.includes(searchTerm);
        const matchesDate = !dateFilter || dateCell === dateFilter;
        row.style.display = matchesSearch && matchesDate ? '' : 'none';
    });
}

function filterConferences() {
    const searchTerm = document.getElementById('conferenceSearch').value.toLowerCase();
    const statusFilter = document.getElementById('conferenceStatusFilter').value;
    document.querySelectorAll('#conferencesTableBody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.querySelector('.status-badge').textContent;
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = !statusFilter || status === statusFilter;
        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

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
document.getElementById('attendeeForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        const formData = new FormData(this);
        const response = await fetch('/api/attendees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        await fetchAttendees();
        this.reset();
        showAlert('attendeeAlert', 'success', 'Attendee added successfully!');
    } catch (error) {
        showAlert('attendeeAlert', 'error', 'Failed to add attendee.');
        console.error('Error:', error);
    }
});

document.getElementById('speakerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        const formData = new FormData(this);
        const response = await fetch('/api/speakers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        await fetchSpeakers();
        this.reset();
        showAlert('speakerAlert', 'success', 'Speaker added successfully!');
    } catch (error) {
        showAlert('speakerAlert', 'error', 'Failed to add speaker.');
        console.error('Error:', error);
    }
});

document.getElementById('sessionForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        const formData = new FormData(this);
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        await fetchSessions();
        this.reset();
        showAlert('sessionAlert', 'success', 'Session added successfully!');
    } catch (error) {
        showAlert('sessionAlert', 'error', 'Failed to add session.');
        console.error('Error:', error);
    }
});

document.getElementById('conferenceForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        const formData = new FormData(this);
        const response = await fetch('/api/conferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        await fetchConferences();
        this.reset();
        showAlert('conferenceAlert', 'success', 'Conference added successfully!');
    } catch (error) {
        showAlert('conferenceAlert', 'error', 'Failed to add conference.');
        console.error('Error:', error);
    }
});

// ---------------- DELETE FUNCTIONS ----------------
async function deleteAttendee(id) {
    if (!confirm('Are you sure you want to delete this attendee?')) return;
    
    try {
        const response = await fetch(`/api/attendees/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchAttendees();
        showAlert('attendeeAlert', 'success', 'Attendee deleted successfully!');
    } catch (error) {
        showAlert('attendeeAlert', 'error', 'Failed to delete attendee.');
        console.error('Error:', error);
    }
}

async function deleteConference(id) {
    if (!confirm('Are you sure you want to delete this conference?')) return;
    
    try {
        const response = await fetch(`/api/conferences/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchConferences();
        showAlert('conferenceAlert', 'success', 'Conference deleted successfully!');
    } catch (error) {
        showAlert('conferenceAlert', 'error', 'Failed to delete conference.');
        console.error('Error:', error);
    }
}

async function deleteSpeaker(id) {
    if (!confirm('Are you sure you want to delete this speaker?')) return;
    
    try {
        const response = await fetch(`/api/speakers/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchSpeakers();
        showAlert('speakerAlert', 'success', 'Speaker deleted successfully!');
    } catch (error) {
        showAlert('speakerAlert', 'error', 'Failed to delete speaker.');
        console.error('Error:', error);
    }
}

async function deleteSession(id) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
        const response = await fetch(`/api/sessions/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        await fetchSessions();
        showAlert('sessionAlert', 'success', 'Session deleted successfully!');
    } catch (error) {
        showAlert('sessionAlert', 'error', 'Failed to delete session.');
        console.error('Error:', error);
    }
}

// ---------------- HELPER FUNCTIONS ----------------
function populateDropdowns() {
    // Populate conference dropdowns
    const conferenceSelects = document.querySelectorAll('.conference-select');
    conferenceSelects.forEach(select => {
        select.innerHTML = `
            <option value="">Select Conference</option>
            ${conferences.map(c => `
                <option value="${c._id}">${c.name}</option>
            `).join('')}
        `;
    });

    // Populate speaker dropdowns
    const speakerSelects = document.querySelectorAll('.speaker-select');
    speakerSelects.forEach(select => {
        select.innerHTML = `
            <option value="">Select Speaker</option>
            ${speakers.map(s => `
                <option value="${s._id}">${s.name}</option>
            `).join('')}
        `;
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

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// ---------------- UPDATE FUNCTIONS ----------------
function updateDashboard() {
    updateDashboardCard('totalAttendees', attendees.length);
    updateDashboardCard('totalSpeakers', speakers.length);
    updateDashboardCard('totalSessions', sessions.length);
    updateDashboardCard('totalConferences', conferences.length);
    updateDashboardCard('totalRevenue', `$${calculateTotalRevenue()}`);
    updateDashboardCard('registrationRate', `${calculateRegistrationRate()}%`);
}

function updateDashboardCard(id, value) {
    const card = document.querySelector(`#${id} .number`);
    if (card) card.textContent = value;
}

function calculateTotalRevenue() {
    const attendeeRevenue = attendees.reduce((total, a) => {
        const ticketPrice = a.ticketType === 'vip' ? 500 : 
                          a.ticketType === 'regular' ? 250 : 100;
        return total + ticketPrice;
    }, 0);

    const speakerFees = speakers.reduce((total, s) => total + (parseFloat(s.fee) || 0), 0);
    
    return (attendeeRevenue - speakerFees).toLocaleString();
}

function calculateRegistrationRate() {
    const totalCapacity = conferences.reduce((total, c) => total + (parseInt(c.capacity) || 0), 0);
    if (totalCapacity === 0) return 0;
    
    const registrationRate = (attendees.length / totalCapacity) * 100;
    return Math.round(registrationRate);
}

function handleFetchError(error, entity) {
    console.error(`Error fetching ${entity}:`, error);
    showAlert(`${entity}Alert`, 'error', `Failed to load ${entity}. Please try again.`);
}

// ---------------- TABLE UPDATES ----------------
function updateTables() {
    updateAttendeesTable();
    updateConferencesTable();
    updateSpeakersTable();
    updateSessionsTable();
}

function updateAttendeesTable() {
    const tbody = document.querySelector('#attendeesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = attendees.map(a => `
        <tr>
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td>${a.company || 'N/A'}</td>
            <td>${conferences.find(c => c._id === a.conference)?.name || 'N/A'}</td>
            <td><span class="status-badge status-${a.status}">${a.status}</span></td>
            <td>
                <button onclick="deleteAttendee('${a._id}')" class="btn btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateSpeakersTable() {
    const tbody = document.querySelector('#speakersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = speakers.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.company || 'N/A'}</td>
            <td>${s.expertise}</td>
            <td>$${s.fee}</td>
            <td>
                <button onclick="deleteSpeaker('${s._id}')" class="btn btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateSessionsTable() {
    const tbody = document.querySelector('#sessionsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = sessions.map(s => `
        <tr>
            <td>${s.title}</td>
            <td>${speakers.find(sp => sp._id === s.speaker)?.name || 'N/A'}</td>
            <td>${conferences.find(c => c._id === s.conference)?.name || 'N/A'}</td>
            <td>${s.date}</td>
            <td>${s.startTime}</td>
            <td>${s.duration} min</td>
            <td>
                <button onclick="deleteSession('${s._id}')" class="btn btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateConferencesTable() {
    const tbody = document.querySelector('#conferencesTable tbody');
    if (!tbody) return;

    tbody.innerHTML = conferences.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.type}</td>
            <td>${c.startDate}</td>
            <td>${c.endDate}</td>
            <td>${c.capacity}</td>
            <td><span class="status-badge status-${c.status}">${c.status}</span></td>
            <td>
                <button onclick="deleteConference('${c._id}')" class="btn btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}
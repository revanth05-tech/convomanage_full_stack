// Dashboard JavaScript
        // Data storage
        let conferences = [];
        let attendees = [];
        let speakers = [];
        let sessions = [];

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadSampleData();
            updateDashboard();
            populateDropdowns();
        });

        // Load sample data
        function loadSampleData() {
            conferences = [
                {
                    id: 1,
                    name: "Tech Innovation Summit 2025",
                    type: "technology",
                    startDate: "2025-06-15",
                    endDate: "2025-06-17",
                    capacity: 500,
                    status: "active",
                    description: "Leading technology conference focusing on AI, blockchain, and emerging technologies."
                },
                {
                    id: 2,
                    name: "Global Business Forum",
                    type: "business",
                    startDate: "2025-07-20",
                    endDate: "2025-07-22",
                    capacity: 300,
                    status: "planning",
                    description: "International business leaders discussing market trends and strategies."
                }
            ];

            speakers = [
                {
                    id: 1,
                    name: "Dr. Sarah Johnson",
                    email: "sarah.johnson@email.com",
                    company: "TechCorp",
                    title: "Chief Technology Officer",
                    expertise: "Artificial Intelligence",
                    fee: 5000,
                    bio: "Leading expert in AI with 15+ years of experience."
                },
                {
                    id: 2,
                    name: "Michael Chen",
                    email: "michael.chen@email.com",
                    company: "InnovateNow",
                    title: "Blockchain Architect",
                    expertise: "Blockchain Technology",
                    fee: 4500,
                    bio: "Pioneering blockchain solutions for enterprise applications."
                }
            ];

            attendees = [
                {
                    id: 1,
                    name: "John Smith",
                    email: "john.smith@email.com",
                    company: "StartupXYZ",
                    title: "Software Engineer",
                    conference: 1,
                    ticketType: "standard",
                    status: "confirmed"
                },
                {
                    id: 2,
                    name: "Emily Davis",
                    email: "emily.davis@email.com",
                    company: "CorpABC",
                    title: "Product Manager",
                    conference: 1,
                    ticketType: "premium",
                    status: "pending"
                },
                {
                    id: 3,
                    name: "Robert Wilson",
                    email: "robert.wilson@email.com",
                    company: "TechGiant",
                    title: "CTO",
                    conference: 2,
                    ticketType: "vip",
                    status: "confirmed"
                }
            ];

            sessions = [
                {
                    id: 1,
                    title: "Future of AI in Business",
                    speaker: 1,
                    conference: 1,
                    date: "2025-06-15",
                    startTime: "09:00",
                    duration: 90,
                    description: "Exploring how AI will transform business operations."
                },
                {
                    id: 2,
                    title: "Blockchain Implementation Strategies",
                    speaker: 2,
                    conference: 1,
                    date: "2025-06-16",
                    startTime: "14:00",
                    duration: 75,
                    description: "Practical approaches to implementing blockchain in enterprises."
                }
            ];
        }

        // Navigation functions
        function showDashboard(dashboardId) {
            // Hide all dashboards
            const dashboards = document.querySelectorAll('.dashboard');
            dashboards.forEach(d => d.classList.remove('active'));

            // Show selected dashboard
            document.getElementById(dashboardId).classList.add('active');

            // Update navigation
            const navBtns = document.querySelectorAll('.nav-btn');
            navBtns.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            // Update data tables
            updateTables();
        }

        // Update dashboard statistics
        function updateDashboard() {
            document.getElementById('totalAttendees').textContent = attendees.length;
            document.getElementById('totalSpeakers').textContent = speakers.length;
            document.getElementById('totalSessions').textContent = sessions.length;
            document.getElementById('totalConferences').textContent = conferences.length;

            // Analytics calculations
            const confirmedAttendees = attendees.filter(a => a.status === 'confirmed').length;
            const registrationRate = attendees.length > 0 ? Math.round((confirmedAttendees / attendees.length) * 100) : 0;
            document.getElementById('registrationRate').textContent = registrationRate + '%';

            // Mock revenue calculation (based on ticket types)
            const revenue = attendees.reduce((total, attendee) => {
                const prices = { standard: 299, premium: 499, vip: 799 };
                return total + (prices[attendee.ticketType] || 0);
            }, 0);
           document.getElementById('totalRevenue').textContent = `$${revenue.toLocaleString()}`;


            // Mock data for other analytics
            document.getElementById('avgRating').textContent = '4.7';
            document.getElementById('totalCountries').textContent = '15';

            updateAnalyticsTable();
        }

        // Populate dropdown menus
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

        // Form submissions
        document.getElementById('attendeeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const attendee = {
                id: attendees.length + 1,
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                title: formData.get('title'),
                conference: parseInt(formData.get('conference')),
                ticketType: formData.get('ticketType'),
                status: 'pending'
            };

            // Check for duplicate email
            if (attendees.some(a => a.email === attendee.email)) {
                showAlert('attendeeAlert', 'error', 'Email already registered!');
                return;
            }

            attendees.push(attendee);
            showAlert('attendeeAlert', 'success', 'Attendee registered successfully!');
            e.target.reset();
            updateDashboard();
            updateTables();
        });

        document.getElementById('speakerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const speaker = {
                id: speakers.length + 1,
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                title: formData.get('title'),
                expertise: formData.get('expertise'),
                fee: parseInt(formData.get('fee')) || 0,
                bio: formData.get('bio')
            };

            // Check for duplicate email
            if (speakers.some(s => s.email === speaker.email)) {
                showAlert('speakerAlert', 'error', 'Speaker email already exists!');
                return;
            }

            speakers.push(speaker);
            showAlert('speakerAlert', 'success', 'Speaker added successfully!');
            e.target.reset();
            updateDashboard();
            populateDropdowns();
            updateTables();
        });

        document.getElementById('sessionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const session = {
                id: sessions.length + 1,
                title: formData.get('title'),
                speaker: parseInt(formData.get('speaker')),
                conference: parseInt(formData.get('conference')),
                date: formData.get('date'),
                startTime: formData.get('startTime'),
                duration: parseInt(formData.get('duration')),
                description: formData.get('description')
            };

            sessions.push(session);
            showAlert('sessionAlert', 'success', 'Session scheduled successfully!');
            e.target.reset();
            updateDashboard();
            updateTables();
        });

        document.getElementById('conferenceForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const conference = {
                id: conferences.length + 1,
                name: formData.get('name'),
                type: formData.get('type'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                capacity: parseInt(formData.get('capacity')),
                status: formData.get('status'),
                description: formData.get('description')
            };

            // Validate dates
            if (new Date(conference.startDate) > new Date(conference.endDate)) {
                showAlert('conferenceAlert', 'error', 'End date must be after start date!');
                return;
            }

            conferences.push(conference);
            showAlert('conferenceAlert', 'success', 'Conference created successfully!');
            e.target.reset();
            updateDashboard();
            populateDropdowns();
            updateTables();
        });

        // Show alerts
        function showAlert(containerId, type, message) {
            const container = document.getElementById(containerId);
            container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }

        // Update all tables
        function updateTables() {
            updateAttendeesTable();
            updateSpeakersTable();
            updateSessionsTable();
            updateConferencesTable();
        }

        // Update attendees table
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
                        <td>${attendee.ticketType.toUpperCase()}</td>
                        <td><span class="status-badge status-${attendee.status}">${attendee.status}</span></td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteAttendee(${attendee.id})">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        // Update speakers table
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
                        <td>${speaker.fee.toLocaleString()}</td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteSpeaker(${speaker.id})">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        // Update sessions table
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
                        <td>
                            <button class="btn btn-danger" onclick="deleteSession(${session.id})">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        // Update conferences table
        function updateConferencesTable() {
            const tbody = document.getElementById('conferencesTableBody');
            tbody.innerHTML = '';

            conferences.forEach(conference => {
                const registeredCount = attendees.filter(a => a.conference === conference.id).length;
                const row = `
                    <tr>
                        <td>${conference.name}</td>
                        <td>${conference.type.toUpperCase()}</td>
                        <td>${conference.startDate}</td>
                        <td>${conference.endDate}</td>
                        <td>${conference.capacity}</td>
                        <td>${registeredCount}</td>
                        <td><span class="status-badge status-${conference.status}">${conference.status}</span></td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteConference(${conference.id})">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        // Update analytics table
        function updateAnalyticsTable() {
            const tbody = document.getElementById('analyticsTableBody');
            tbody.innerHTML = '';

            conferences.forEach(conference => {
                const conferenceAttendees = attendees.filter(a => a.conference === conference.id);
                const conferenceSessions = sessions.filter(s => s.conference === conference.id);
                const completionRate = Math.floor(Math.random() * 30) + 70; // Mock data
                const revenue = conferenceAttendees.reduce((total, attendee) => {
                    const prices = { standard: 299, premium: 499, vip: 799 };
                    return total + (prices[attendee.ticketType] || 0);
                }, 0);
                const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // Mock rating between 3.5-5.0

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

        // Delete functions
        function deleteAttendee(id) {
            if (confirm('Are you sure you want to delete this attendee?')) {
                attendees = attendees.filter(a => a.id !== id);
                updateDashboard();
                updateTables();
            }
        }

        function deleteSpeaker(id) {
            if (confirm('Are you sure you want to delete this speaker?')) {
                speakers = speakers.filter(s => s.id !== id);
                updateDashboard();
                populateDropdowns();
                updateTables();
            }
        }

        function deleteSession(id) {
            if (confirm('Are you sure you want to delete this session?')) {
                sessions = sessions.filter(s => s.id !== id);
                updateDashboard();
                updateTables();
            }
        }

        function deleteConference(id) {
            if (confirm('Are you sure you want to delete this conference? This will also remove all associated attendees and sessions.')) {
                conferences = conferences.filter(c => c.id !== id);
                attendees = attendees.filter(a => a.conference !== id);
                sessions = sessions.filter(s => s.conference !== id);
                updateDashboard();
                populateDropdowns();
                updateTables();
            }
        }

        // Filter functions
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
            const rows = document.querySelectorAll('#speakersTableBody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        function filterSessions() {
            const searchTerm = document.getElementById('sessionSearch').value.toLowerCase();
            const dateFilter = document.getElementById('sessionDateFilter').value;
            const rows = document.querySelectorAll('#sessionsTableBody tr');

            rows.forEach(row => {
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
            const rows = document.querySelectorAll('#conferencesTableBody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const status = row.querySelector('.status-badge').textContent;
                const matchesSearch = text.includes(searchTerm);
                const matchesStatus = !statusFilter || status === statusFilter;
                row.style.display = matchesSearch && matchesStatus ? '' : 'none';
            });
        }
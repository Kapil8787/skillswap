document.addEventListener('DOMContentLoaded', function() {
    // Initialize matching functionality
    initializeMatching();
});

// This function can be called by the page transitions system
function initializeMatching() {
    // DOM Elements
    const skillSearch = document.getElementById('skillSearch');
    const locationFilter = document.getElementById('locationFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const sortResults = document.getElementById('sortResults');
    const resultsGrid = document.getElementById('resultsGrid');
    const noResults = document.getElementById('noResults');

    // Get current user from localStorage
    const currentUser = getCurrentUser();

    // Sample data - In a real app, this would come from an API
    const users = [
        {
            id: 1,
            name: 'Alex Thompson',
            title: 'Frontend Developer',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=1',
            skillsToTeach: ['JavaScript', 'React', 'CSS'],
            skillsToLearn: ['Python', 'UI/UX Design'],
            location: 'virtual',
            availability: 'weekends',
            rating: 4.8,
            matchPercentage: 85
        },
        {
            id: 2,
            name: 'Sarah Chen',
            title: 'Graphic Designer',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=2',
            skillsToTeach: ['UI/UX Design', 'Adobe Illustrator', 'Figma'],
            skillsToLearn: ['JavaScript', 'Web Development'],
            location: 'local',
            availability: 'weekdays',
            rating: 4.5,
            matchPercentage: 78
        },
        {
            id: 3,
            name: 'Michael Rodriguez',
            title: 'Data Scientist',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=3',
            skillsToTeach: ['Python', 'Machine Learning', 'Data Analysis'],
            skillsToLearn: ['Spanish', 'Public Speaking'],
            location: 'virtual',
            availability: 'evenings',
            rating: 4.9,
            matchPercentage: 92
        },
        {
            id: 4,
            name: 'Emily Johnson',
            title: 'Language Teacher',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=4',
            skillsToTeach: ['Spanish', 'French', 'ESL'],
            skillsToLearn: ['Web Development', 'Digital Marketing'],
            location: 'local',
            availability: 'flexible',
            rating: 4.7,
            matchPercentage: 65
        },
        {
            id: 5,
            name: 'David Kim',
            title: 'Mobile Developer',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=5',
            skillsToTeach: ['Swift', 'React Native', 'iOS Development'],
            skillsToLearn: ['UI/UX Design', 'Backend Development'],
            location: 'virtual',
            availability: 'weekends',
            rating: 4.6,
            matchPercentage: 88
        },
        {
            id: 6,
            name: 'Lisa Patel',
            title: 'Marketing Specialist',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=6',
            skillsToTeach: ['Digital Marketing', 'Content Strategy', 'SEO'],
            skillsToLearn: ['Data Analysis', 'Graphic Design'],
            location: 'local',
            availability: 'weekdays',
            rating: 4.4,
            matchPercentage: 72
        }
    ];

    // Current filters state
    let currentFilters = {
        skill: '',
        location: '',
        availability: '',
        minRating: 0
    };

    // Initialize the page
    function init() {
        renderUserCards(users);
        setupEventListeners();
        createRequestInboxButton();
        setupToastContainer();
    }

    // Get current user from localStorage
    function getCurrentUser() {
        // First try to get from userSettings (more complete data)
        const userSettings = localStorage.getItem('userSettings');
        if (userSettings) {
            const settings = JSON.parse(userSettings);
            return {
                id: 1, // In a real app, this would be a real user ID
                name: settings.name,
                email: settings.email,
                avatar: localStorage.getItem('profilePhoto') || 'https://api.dicebear.com/6.x/avataaars/svg?seed=1',
                bio: settings.bio,
                location: settings.location,
                skillsOffered: settings.skillsOffered,
                skillsWanted: settings.skillsWanted
            };
        }
        
        // Then try currentUser
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            return {
                id: 1, // In a real app, this would be a real user ID
                name: user.name,
                email: user.email,
                avatar: user.photo || 'https://api.dicebear.com/6.x/avataaars/svg?seed=1'
            };
        }
        
        // Default user if none is stored
        return {
            id: 1,
            name: 'Alex Thompson',
            email: 'alex@example.com',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=1'
        };
    }

    // Create request inbox button in the header
    function createRequestInboxButton() {
        const mobileHeader = document.querySelector('.mobile-header');
        const desktopHeader = document.querySelector('.container.py-4 h1').parentNode;
        
        // Create the button for desktop
        const inboxBtnDesktop = document.createElement('button');
        inboxBtnDesktop.className = 'btn btn-primary position-relative ms-auto d-none d-md-block';
        inboxBtnDesktop.innerHTML = `
            <i class="fas fa-envelope me-2"></i>Connection Requests
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                2
                <span class="visually-hidden">unread messages</span>
            </span>
        `;
        inboxBtnDesktop.addEventListener('click', openRequestInbox);
        
        // Create the button for mobile
        const inboxBtnMobile = document.createElement('button');
        inboxBtnMobile.className = 'btn btn-sm btn-primary position-relative d-md-none';
        inboxBtnMobile.innerHTML = `
            <i class="fas fa-envelope"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                2
                <span class="visually-hidden">unread messages</span>
            </span>
        `;
        inboxBtnMobile.addEventListener('click', openRequestInbox);
        
        // Add buttons to the page
        const headerContainer = document.createElement('div');
        headerContainer.className = 'd-flex align-items-center mb-4';
        headerContainer.appendChild(document.querySelector('.container.py-4 h1').cloneNode(true));
        headerContainer.appendChild(inboxBtnDesktop);
        
        desktopHeader.replaceChild(headerContainer, document.querySelector('.container.py-4 h1'));
        mobileHeader.appendChild(inboxBtnMobile);
    }

    // Set up toast container for notifications
    function setupToastContainer() {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toastId = 'toast-' + Date.now();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }

    // Send connection request
    async function sendConnectionRequest(toUserId) {
        try {
            const fromUserId = currentUser.id;
            
            // In a real app, this would be an actual API call
            // For demo purposes, we'll simulate the API call
            const response = await simulateApiCall('/send-request', 'POST', {
                from_user: fromUserId,
                to_user: toUserId
            });
            
            if (response.success) {
                showToast('Connection request sent successfully!');
                
                // Update button state
                const connectBtn = document.querySelector(`[data-user-id="${toUserId}"]`);
                if (connectBtn) {
                    connectBtn.disabled = true;
                    connectBtn.innerHTML = '<i class="fas fa-check me-2"></i>Request Sent';
                    connectBtn.classList.add('btn-secondary');
                    connectBtn.classList.remove('connect-btn');
                }
                
                // Store sent request in localStorage for demo purposes
                storeSentRequest(toUserId);
            } else {
                showToast('Failed to send request. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
            showToast('An error occurred. Please try again later.', 'danger');
        }
    }

    // Store sent request in localStorage (for demo purposes)
    function storeSentRequest(toUserId) {
        const sentRequests = JSON.parse(localStorage.getItem('sentRequests') || '[]');
        sentRequests.push({
            from_user: currentUser.id,
            to_user: toUserId,
            status: 'pending',
            created_at: new Date().toISOString()
        });
        localStorage.setItem('sentRequests', JSON.stringify(sentRequests));
    }

    // Simulate API call (for demo purposes)
    function simulateApiCall(endpoint, method, data) {
        return new Promise((resolve) => {
            // Show loading spinner
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-25';
            loadingSpinner.style.zIndex = '9999';
            loadingSpinner.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            `;
            document.body.appendChild(loadingSpinner);
            
            // Simulate network delay
            setTimeout(() => {
                // Remove loading spinner
                loadingSpinner.remove();
                
                // Simulate successful response
                resolve({
                    success: true,
                    message: 'Operation completed successfully',
                    data: { ...data, id: Math.floor(Math.random() * 1000) }
                });
            }, 1000);
        });
    }

    // Open request inbox modal
    function openRequestInbox() {
        // Create modal if it doesn't exist
        if (!document.getElementById('requestInboxModal')) {
            createRequestInboxModal();
        }
        
        // Populate with requests
        populateRequestInbox();
        
        // Show the modal
        const requestModal = new bootstrap.Modal(document.getElementById('requestInboxModal'));
        requestModal.show();
    }

    // Create request inbox modal
    function createRequestInboxModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'requestInboxModal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'requestInboxModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="requestInboxModalLabel">
                            <i class="fas fa-envelope me-2"></i>Connection Requests
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs mb-3" id="requestTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="received-tab" data-bs-toggle="tab" data-bs-target="#received" type="button" role="tab" aria-controls="received" aria-selected="true">
                                    Received
                                    <span class="badge bg-danger ms-2">2</span>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="sent-tab" data-bs-toggle="tab" data-bs-target="#sent" type="button" role="tab" aria-controls="sent" aria-selected="false">
                                    Sent
                                </button>
                            </li>
                        </ul>
                        <div class="tab-content" id="requestTabsContent">
                            <div class="tab-pane fade show active" id="received" role="tabpanel" aria-labelledby="received-tab">
                                <div id="receivedRequestsList" class="request-list">
                                    <!-- Received requests will be populated here -->
                                    <div class="text-center py-5 d-none" id="noReceivedRequests">
                                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                        <h5>No connection requests</h5>
                                        <p class="text-muted">When someone sends you a connection request, it will appear here</p>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="sent" role="tabpanel" aria-labelledby="sent-tab">
                                <div id="sentRequestsList" class="request-list">
                                    <!-- Sent requests will be populated here -->
                                    <div class="text-center py-5 d-none" id="noSentRequests">
                                        <i class="fas fa-paper-plane fa-3x text-muted mb-3"></i>
                                        <h5>No sent requests</h5>
                                        <p class="text-muted">Requests you've sent will appear here</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Populate request inbox with sample data
    function populateRequestInbox() {
        const receivedRequestsList = document.getElementById('receivedRequestsList');
        const sentRequestsList = document.getElementById('sentRequestsList');
        const noReceivedRequests = document.getElementById('noReceivedRequests');
        const noSentRequests = document.getElementById('noSentRequests');
        
        // Clear previous content
        receivedRequestsList.innerHTML = '';
        sentRequestsList.innerHTML = '';
        
        // Sample received requests (in a real app, this would come from an API)
        const receivedRequests = [
            {
                id: 101,
                from_user: {
                    id: 2,
                    name: 'Sarah Chen',
                    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=2',
                    title: 'Graphic Designer'
                },
                status: 'pending',
                created_at: '2024-07-15T10:30:00Z'
            },
            {
                id: 102,
                from_user: {
                    id: 3,
                    name: 'Michael Rodriguez',
                    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=3',
                    title: 'Data Scientist'
                },
                status: 'pending',
                created_at: '2024-07-14T15:45:00Z'
            }
        ];
        
        // Get sent requests from localStorage (for demo purposes)
        const sentRequests = JSON.parse(localStorage.getItem('sentRequests') || '[]');
        
        // Map sent requests to include user details
        const mappedSentRequests = sentRequests.map(request => {
            const toUser = users.find(user => user.id === request.to_user);
            return {
                ...request,
                to_user: toUser || {
                    id: request.to_user,
                    name: 'Unknown User',
                    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=unknown',
                    title: 'User'
                }
            };
        });
        
        // Show/hide no requests messages
        if (receivedRequests.length === 0) {
            noReceivedRequests.classList.remove('d-none');
        } else {
            noReceivedRequests.classList.add('d-none');
            
            // Render received requests
            receivedRequests.forEach(request => {
                const requestItem = createRequestItem(request, 'received');
                receivedRequestsList.appendChild(requestItem);
            });
        }
        
        if (mappedSentRequests.length === 0) {
            noSentRequests.classList.remove('d-none');
        } else {
            noSentRequests.classList.add('d-none');
            
            // Render sent requests
            mappedSentRequests.forEach(request => {
                const requestItem = createRequestItem(request, 'sent');
                sentRequestsList.appendChild(requestItem);
            });
        }
    }

    // Create a request item element
    function createRequestItem(request, type) {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        
        if (type === 'received') {
            requestItem.innerHTML = `
                <div class="request-user">
                    <img src="${request.from_user.avatar}" alt="${request.from_user.name}" class="request-avatar">
                    <div>
                        <h5 class="request-name">${request.from_user.name}</h5>
                        <p class="request-title">${request.from_user.title}</p>
                        <p class="request-time">
                            <i class="far fa-clock me-1"></i>
                            ${formatTimeAgo(new Date(request.created_at))}
                        </p>
                    </div>
                </div>
                <div class="request-actions">
                    <button class="btn btn-success btn-sm accept-request" data-request-id="${request.id}">
                        <i class="fas fa-check me-1"></i>Accept
                    </button>
                    <button class="btn btn-outline-danger btn-sm reject-request" data-request-id="${request.id}">
                        <i class="fas fa-times me-1"></i>Reject
                    </button>
                </div>
            `;
            
            // Add event listeners for accept/reject buttons
            requestItem.querySelector('.accept-request').addEventListener('click', function() {
                handleRequestResponse(request.id, 'accept');
            });
            
            requestItem.querySelector('.reject-request').addEventListener('click', function() {
                handleRequestResponse(request.id, 'reject');
            });
        } else {
            requestItem.innerHTML = `
                <div class="request-user">
                    <img src="${request.to_user.avatar}" alt="${request.to_user.name}" class="request-avatar">
                    <div>
                        <h5 class="request-name">${request.to_user.name}</h5>
                        <p class="request-title">${request.to_user.title || 'User'}</p>
                        <p class="request-time">
                            <i class="far fa-clock me-1"></i>
                            ${formatTimeAgo(new Date(request.created_at))}
                        </p>
                    </div>
                </div>
                <div class="request-status">
                    <span class="badge bg-secondary">Pending</span>
                </div>
            `;
        }
        
        return requestItem;
    }

    // Handle request response (accept/reject)
    async function handleRequestResponse(requestId, action) {
        try {
            const endpoint = action === 'accept' ? '/accept-request' : '/reject-request';
            
            // In a real app, this would be an actual API call
            const response = await simulateApiCall(endpoint, 'POST', {
                request_id: requestId
            });
            
            if (response.success) {
                // Show success message
                showToast(`Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
                
                // Update UI
                const requestItem = document.querySelector(`[data-request-id="${requestId}"]`).closest('.request-item');
                
                if (action === 'accept') {
                    // Redirect to scheduling page
                    setTimeout(() => {
                        window.location.href = 'schedule.html?new_connection=true';
                    }, 1500);
                } else {
                    // Remove the request item with animation
                    requestItem.style.opacity = '0';
                    setTimeout(() => {
                        requestItem.remove();
                        
                        // Check if there are no more requests
                        const receivedRequestsList = document.getElementById('receivedRequestsList');
                        if (receivedRequestsList.children.length === 0) {
                            document.getElementById('noReceivedRequests').classList.remove('d-none');
                        }
                    }, 300);
                }
            } else {
                showToast(`Failed to ${action} request. Please try again.`, 'danger');
            }
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            showToast('An error occurred. Please try again later.', 'danger');
        }
    }

    // Format time ago
    function formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    // Set up event listeners
    function setupEventListeners() {
        // Apply filters button
        applyFiltersBtn.addEventListener('click', applyFilters);

        // Sort results
        sortResults.addEventListener('change', function() {
            const sortedUsers = [...filteredUsers];
            const sortBy = this.value;
            
            switch(sortBy) {
                case 'match':
                    sortedUsers.sort((a, b) => b.matchPercentage - a.matchPercentage);
                    break;
                case 'rating':
                    sortedUsers.sort((a, b) => b.rating - a.rating);
                    break;
                case 'name':
                    sortedUsers.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
            
            renderUserCards(sortedUsers);
        });

        // Enter key in search field
        skillSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });

        // Event delegation for connect buttons
        resultsGrid.addEventListener('click', function(e) {
            const connectBtn = e.target.closest('.connect-btn');
            if (connectBtn) {
                const userCard = connectBtn.closest('.user-card');
                const userId = parseInt(connectBtn.getAttribute('data-user-id'));
                sendConnectionRequest(userId);
            }
        });
    }

    // Apply filters to the user list
    function applyFilters() {
        // Update current filters
        currentFilters = {
            skill: skillSearch.value.toLowerCase(),
            location: locationFilter.value,
            availability: availabilityFilter.value,
            minRating: parseInt(ratingFilter.value) || 0
        };

        // Filter users based on criteria
        const filtered = users.filter(user => {
            // Skill filter - check if user teaches or wants to learn the searched skill
            const skillMatch = currentFilters.skill === '' || 
                user.skillsToTeach.some(skill => skill.toLowerCase().includes(currentFilters.skill)) ||
                user.skillsToLearn.some(skill => skill.toLowerCase().includes(currentFilters.skill));
            
            // Location filter
            const locationMatch = currentFilters.location === '' || user.location === currentFilters.location;
            
            // Availability filter
            const availabilityMatch = currentFilters.availability === '' || user.availability === currentFilters.availability;
            
            // Rating filter
            const ratingMatch = user.rating >= currentFilters.minRating;
            
            return skillMatch && locationMatch && availabilityMatch && ratingMatch;
        });

        // Store filtered users for sorting
        window.filteredUsers = filtered;
        
        // Render the filtered results
        renderUserCards(filtered);
    }

    // Render user cards in the grid
    function renderUserCards(users) {
        // Clear the grid
        resultsGrid.innerHTML = '';
        
        // Show/hide no results message
        if (users.length === 0) {
            noResults.classList.remove('d-none');
            return;
        } else {
            noResults.classList.add('d-none');
        }
        
        // Create and append user cards
        users.forEach((user, index) => {
            const card = createUserCard(user, index);
            resultsGrid.appendChild(card);
        });
    }

    // Create a user card element
    function createUserCard(user, index) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        // Calculate animation delay
        const delay = index * 0.1;
        
        // Check if request already sent (for demo purposes)
        const sentRequests = JSON.parse(localStorage.getItem('sentRequests') || '[]');
        const alreadySent = sentRequests.some(req => req.to_user === user.id);
        
        // Create connect button based on status
        let connectBtnHtml = '';
        if (user.id === currentUser.id) {
            connectBtnHtml = `
                <button class="btn btn-secondary" disabled>
                    <i class="fas fa-user me-2"></i>This is You
                </button>
            `;
        } else if (alreadySent) {
            connectBtnHtml = `
                <button class="btn btn-secondary" disabled>
                    <i class="fas fa-check me-2"></i>Request Sent
                </button>
            `;
        } else {
            connectBtnHtml = `
                <button class="btn connect-btn" data-user-id="${user.id}">
                    <i class="fas fa-handshake me-2"></i>Connect
                </button>
            `;
        }
        
        col.innerHTML = `
            <div class="user-card" style="animation-delay: ${delay}s">
                <span class="match-badge">${user.matchPercentage}% Match</span>
                <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                <h3 class="user-name">${user.name}</h3>
                <p class="user-title">${user.title}</p>
                
                <div class="rating">
                    ${generateStarRating(user.rating)}
                    <small class="text-muted">(${user.rating})</small>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted d-block mb-2">Can teach:</small>
                    ${user.skillsToTeach.map(skill => `<span class="skill-tag teach">${skill}</span>`).join('')}
                </div>
                
                <div class="mb-3">
                    <small class="text-muted d-block mb-2">Wants to learn:</small>
                    ${user.skillsToLearn.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                
                <div class="d-flex align-items-center mb-3">
                    <span class="badge bg-light text-dark me-2">
                        <i class="fas fa-map-marker-alt me-1"></i> ${capitalizeFirstLetter(user.location)}
                    </span>
                    <span class="badge bg-light text-dark">
                        <i class="fas fa-clock me-1"></i> ${capitalizeFirstLetter(user.availability)}
                    </span>
                </div>
                
                ${connectBtnHtml}
            </div>
        `;
        
        return col;
    }

    // Generate star rating HTML
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Initialize the page
    init();
}
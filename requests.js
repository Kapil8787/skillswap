document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initRequestsPage();
});

/**
 * Initialize the requests page
 */
function initRequestsPage() {
    // Get current user
    const currentUser = getCurrentUser();
    
    // Load requests data
    loadRequestsData();
    
    // Set up event listeners
    setupEventListeners();
}

/**
 * Get current user from localStorage
 * @returns {Object} - The current user object
 */
function getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        return JSON.parse(storedUser);
    }
    // Default user if none is stored
    return {
        id: 1,
        name: 'Alex Thompson',
        email: 'alex@example.com',
        avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=1'
    };
}

/**
 * Load requests data from API (simulated)
 */
async function loadRequestsData() {
    try {
        // Show loading spinner
        showLoadingSpinner();
        
        // Get current user
        const currentUser = getCurrentUser();
        
        // In a real app, these would be API calls
        // For demo purposes, we'll use sample data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample received requests
        const receivedRequests = [
            {
                id: 101,
                from_user: {
                    id: 2,
                    name: 'Sarah Chen',
                    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=2',
                    title: 'Graphic Designer',
                    skills_to_teach: ['UI/UX Design', 'Adobe Illustrator', 'Figma'],
                    skills_to_learn: ['JavaScript', 'Web Development']
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
                    title: 'Data Scientist',
                    skills_to_teach: ['Python', 'Machine Learning', 'Data Analysis'],
                    skills_to_learn: ['Spanish', 'Public Speaking']
                },
                status: 'pending',
                created_at: '2024-07-14T15:45:00Z'
            }
        ];
        
        // Get sent requests from localStorage (for demo purposes)
        const sentRequests = JSON.parse(localStorage.getItem('sentRequests') || '[]');
        
        // Sample connected users
        const connectedUsers = [
            {
                id: 201,
                user: {
                    id: 5,
                    name: 'David Kim',
                    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=5',
                    title: 'Mobile Developer',
                    skills_to_teach: ['Swift', 'React Native', 'iOS Development'],
                    skills_to_learn: ['UI/UX Design', 'Backend Development']
                },
                connected_at: '2024-07-10T09:15:00Z',
                last_session: '2024-07-12T14:00:00Z',
                next_session: '2024-07-20T14:00:00Z'
            }
        ];
        
        // Populate the UI with the data
        populateReceivedRequests(receivedRequests);
        populateSentRequests(sentRequests);
        populateConnectedUsers(connectedUsers);
        
        // Hide loading spinner
        hideLoadingSpinner();
    } catch (error) {
        console.error('Error loading requests data:', error);
        showToast('Failed to load requests data. Please try again.', 'danger');
        hideLoadingSpinner();
    }
}

/**
 * Populate received requests list
 * @param {Array} requests - Array of received request objects
 */
function populateReceivedRequests(requests) {
    const receivedRequestsList = document.getElementById('receivedRequestsList');
    const noReceivedRequests = document.getElementById('noReceivedRequests');
    
    // Clear previous content
    receivedRequestsList.innerHTML = '';
    
    // Show/hide no requests message
    if (requests.length === 0) {
        noReceivedRequests.classList.remove('d-none');
    } else {
        noReceivedRequests.classList.add('d-none');
        
        // Render received requests
        requests.forEach((request, index) => {
            const requestItem = createRequestItem(request, 'received', index);
            receivedRequestsList.appendChild(requestItem);
        });
    }
}

/**
 * Populate sent requests list
 * @param {Array} requests - Array of sent request objects
 */
function populateSentRequests(requests) {
    const sentRequestsList = document.getElementById('sentRequestsList');
    const noSentRequests = document.getElementById('noSentRequests');
    
    // Clear previous content
    sentRequestsList.innerHTML = '';
    
    // Show/hide no requests message
    if (requests.length === 0) {
        noSentRequests.classList.remove('d-none');
    } else {
        noSentRequests.classList.add('d-none');
        
        // Map sent requests to include user details (in a real app, this would come from the API)
        const mappedRequests = requests.map(request => {
            // Sample user data for demo purposes
            const toUser = {
                id: request.to_user,
                name: request.to_user === 2 ? 'Sarah Chen' : 
                      request.to_user === 3 ? 'Michael Rodriguez' : 
                      request.to_user === 4 ? 'Emily Johnson' : 
                      request.to_user === 5 ? 'David Kim' : 
                      request.to_user === 6 ? 'Lisa Patel' : 'Unknown User',
                avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${request.to_user}`,
                title: request.to_user === 2 ? 'Graphic Designer' : 
                       request.to_user === 3 ? 'Data Scientist' : 
                       request.to_user === 4 ? 'Language Teacher' : 
                       request.to_user === 5 ? 'Mobile Developer' : 
                       request.to_user === 6 ? 'Marketing Specialist' : 'User',
                skills_to_teach: [],
                skills_to_learn: []
            };
            
            return {
                id: request.id || Math.floor(Math.random() * 1000),
                to_user: toUser,
                status: request.status || 'pending',
                created_at: request.created_at
            };
        });
        
        // Render sent requests
        mappedRequests.forEach((request, index) => {
            const requestItem = createRequestItem(request, 'sent', index);
            sentRequestsList.appendChild(requestItem);
        });
    }
}

/**
 * Populate connected users list
 * @param {Array} connections - Array of connected user objects
 */
function populateConnectedUsers(connections) {
    const connectedUsersList = document.getElementById('connectedUsersList');
    const noConnections = document.getElementById('noConnections');
    
    // Clear previous content
    connectedUsersList.innerHTML = '';
    
    // Show/hide no connections message
    if (connections.length === 0) {
        noConnections.classList.remove('d-none');
    } else {
        noConnections.classList.add('d-none');
        
        // Render connected users
        connections.forEach((connection, index) => {
            const connectionItem = createConnectionItem(connection, index);
            connectedUsersList.appendChild(connectionItem);
        });
    }
}

/**
 * Create a request item element
 * @param {Object} request - The request object
 * @param {string} type - The type of request ('received' or 'sent')
 * @param {number} index - The index for animation delay
 * @returns {HTMLElement} - The request item element
 */
function createRequestItem(request, type, index) {
    const requestItem = document.createElement('div');
    requestItem.className = 'request-item';
    requestItem.style.animationDelay = `${index * 0.1}s`;
    
    if (type === 'received') {
        const user = request.from_user;
        
        requestItem.innerHTML = `
            <div class="request-user">
                <img src="${user.avatar}" alt="${user.name}" class="request-avatar">
                <div class="request-info">
                    <h5 class="request-name">${user.name}</h5>
                    <p class="request-title">${user.title}</p>
                    <div class="request-skills">
                        ${user.skills_to_teach.slice(0, 2).map(skill => 
                            `<span class="skill-tag teach">${skill}</span>`
                        ).join('')}
                        ${user.skills_to_learn.slice(0, 2).map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                    </div>
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
        const user = request.to_user;
        
        requestItem.innerHTML = `
            <div class="request-user">
                <img src="${user.avatar}" alt="${user.name}" class="request-avatar">
                <div class="request-info">
                    <h5 class="request-name">${user.name}</h5>
                    <p class="request-title">${user.title}</p>
                    <p class="request-time">
                        <i class="far fa-clock me-1"></i>
                        ${formatTimeAgo(new Date(request.created_at))}
                    </p>
                </div>
            </div>
            <div class="request-status">
                <span class="badge bg-warning">Pending</span>
                <button class="btn btn-outline-danger btn-sm ms-3 cancel-request" data-request-id="${request.id}">
                    <i class="fas fa-times me-1"></i>Cancel
                </button>
            </div>
        `;
        
        // Add event listener for cancel button
        requestItem.querySelector('.cancel-request').addEventListener('click', function() {
            handleCancelRequest(request.id);
        });
    }
    
    return requestItem;
}

/**
 * Create a connection item element
 * @param {Object} connection - The connection object
 * @param {number} index - The index for animation delay
 * @returns {HTMLElement} - The connection item element
 */
function createConnectionItem(connection, index) {
    const connectionItem = document.createElement('div');
    connectionItem.className = 'request-item';
    connectionItem.style.animationDelay = `${index * 0.1}s`;
    
    const user = connection.user;
    
    // Format dates
    const connectedDate = formatDate(new Date(connection.connected_at));
    const lastSessionDate = connection.last_session ? formatDate(new Date(connection.last_session)) : 'No sessions yet';
    const nextSessionDate = connection.next_session ? formatDate(new Date(connection.next_session)) : 'None scheduled';
    
    connectionItem.innerHTML = `
        <div class="request-user">
            <img src="${user.avatar}" alt="${user.name}" class="request-avatar">
            <div class="request-info">
                <h5 class="request-name">${user.name}</h5>
                <p class="request-title">${user.title}</p>
                <div class="request-skills">
                    ${user.skills_to_teach.slice(0, 2).map(skill => 
                        `<span class="skill-tag teach">${skill}</span>`
                    ).join('')}
                    ${user.skills_to_learn.slice(0, 2).map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                </div>
                <p class="request-time">
                    <i class="fas fa-handshake me-1"></i>
                    Connected since ${connectedDate}
                </p>
            </div>
        </div>
        <div class="request-actions">
            <button class="btn btn-outline-primary btn-sm message-user" data-user-id="${user.id}">
                <i class="fas fa-comment me-1"></i>Message
            </button>
            <button class="btn btn-success btn-sm schedule-session" data-user-id="${user.id}">
                <i class="fas fa-calendar-plus me-1"></i>Schedule
            </button>
        </div>
    `;
    
    // Add event listeners for buttons
    connectionItem.querySelector('.message-user').addEventListener('click', function() {
        window.location.href = `chat.html?user=${user.id}`;
    });
    
    connectionItem.querySelector('.schedule-session').addEventListener('click', function() {
        window.location.href = `schedule.html?partner=${user.id}`;
    });
    
    return connectionItem;
}

/**
 * Handle request response (accept/reject)
 * @param {number} requestId - The request ID
 * @param {string} action - The action to take ('accept' or 'reject')
 */
async function handleRequestResponse(requestId, action) {
    try {
        // Show loading spinner
        showLoadingSpinner();
        
        const endpoint = action === 'accept' ? '/accept-request' : '/reject-request';
        
        // In a real app, this would be an actual API call
        // For demo purposes, we'll simulate the API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Hide loading spinner
        hideLoadingSpinner();
        
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
    } catch (error) {
        console.error(`Error ${action}ing request:`, error);
        showToast('An error occurred. Please try again later.', 'danger');
        hideLoadingSpinner();
    }
}

/**
 * Handle cancel request
 * @param {number} requestId - The request ID
 */
async function handleCancelRequest(requestId) {
    try {
        if (confirm('Are you sure you want to cancel this request?')) {
            // Show loading spinner
            showLoadingSpinner();
            
            // In a real app, this would be an actual API call
            // For demo purposes, we'll simulate the API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Remove from localStorage (for demo purposes)
            const sentRequests = JSON.parse(localStorage.getItem('sentRequests') || '[]');
            const updatedRequests = sentRequests.filter(req => req.id !== requestId);
            localStorage.setItem('sentRequests', JSON.stringify(updatedRequests));
            
            // Hide loading spinner
            hideLoadingSpinner();
            
            // Show success message
            showToast('Request cancelled successfully!');
            
            // Update UI
            const requestItem = document.querySelector(`[data-request-id="${requestId}"]`).closest('.request-item');
            requestItem.style.opacity = '0';
            setTimeout(() => {
                requestItem.remove();
                
                // Check if there are no more requests
                const sentRequestsList = document.getElementById('sentRequestsList');
                if (sentRequestsList.children.length === 0) {
                    document.getElementById('noSentRequests').classList.remove('d-none');
                }
            }, 300);
        }
    } catch (error) {
        console.error('Error cancelling request:', error);
        showToast('An error occurred. Please try again later.', 'danger');
        hideLoadingSpinner();
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Tab change event
    const requestTabs = document.getElementById('requestTabs');
    if (requestTabs) {
        requestTabs.addEventListener('shown.bs.tab', function(e) {
            // Update URL with active tab
            const tabId = e.target.id;
            history.replaceState(null, null, `?tab=${tabId.replace('-tab', '')}`);
        });
    }
    
    // Check URL for active tab
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab');
    if (activeTab) {
        const tab = document.getElementById(`${activeTab}-tab`);
        if (tab) {
            const bsTab = new bootstrap.Tab(tab);
            bsTab.show();
        }
    }
}

/**
 * Show loading spinner
 */
function showLoadingSpinner() {
    // Check if spinner already exists
    if (document.getElementById('loadingSpinner')) return;
    
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-25';
    spinner.style.zIndex = '9999';
    spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    
    document.body.appendChild(spinner);
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success', 'danger', etc.)
 */
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

/**
 * Format time ago
 * @param {Date} date - The date to format
 * @returns {string} - Formatted time ago string
 */
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

/**
 * Format date to a readable format
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
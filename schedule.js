/**
 * SkillSwap Schedule Page JavaScript
 * Handles form validation, session management, and responsive behavior
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initSchedulePage();
});

/**
 * Initialize the schedule page with all necessary event listeners and functionality
 */
function initSchedulePage() {
    // Set minimum date to today
    setMinDate();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Initialize session management
    initSessionManagement();
    
    // Add responsive behavior
    addResponsiveBehavior();
    
    // Check for new connection parameter
    checkForNewConnection();
}

/**
 * Set the minimum date for the date input to today
 */
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('sessionDate');
    
    if (dateInput) {
        dateInput.min = today;
        
        // Set default time to next hour
        const timeInput = document.getElementById('sessionTime');
        if (timeInput) {
            const now = new Date();
            const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
            const hours = nextHour.getHours().toString().padStart(2, '0');
            const minutes = nextHour.getMinutes().toString().padStart(2, '0');
            timeInput.value = `${hours}:${minutes}`;
        }
    }
}

/**
 * Initialize form handlers for the scheduling form
 */
function initFormHandlers() {
    const scheduleForm = document.getElementById('scheduleForm');
    
    if (scheduleForm) {
        // Form submission handler
        scheduleForm.addEventListener('submit', handleFormSubmission);
        
        // Partner selection handler
        const partnerSelect = document.getElementById('partnerSelect');
        if (partnerSelect) {
            partnerSelect.addEventListener('change', updateSkillOptions);
        }
    }
}

/**
 * Handle form submission
 * @param {Event} e - The form submission event
 */
async function handleFormSubmission(e) {
    e.preventDefault();
    
    // Get form values
    const partner = document.getElementById('partnerSelect').value;
    const skill = document.getElementById('skillSelect').value;
    const date = document.getElementById('sessionDate').value;
    const time = document.getElementById('sessionTime').value;
    const type = document.getElementById('sessionType').value;
    
    // Validate form
    if (!partner || !skill || !date || !time || !type) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Get current user from localStorage
    const currentUser = getCurrentUser();
    
    // Create session data object
    const sessionData = {
        user1: currentUser.id,
        user2: parseInt(partner),
        skill: document.getElementById('skillSelect').options[document.getElementById('skillSelect').selectedIndex].text,
        date: date,
        time: time,
        type: type
    };
    
    // Send session data to server
    const response = await sendSessionRequest(sessionData);
    
    if (response.success) {
        // Create a new session object for UI
        const newSession = {
            partnerId: partner,
            partnerName: document.getElementById('partnerSelect').options[document.getElementById('partnerSelect').selectedIndex].text,
            skill: document.getElementById('skillSelect').options[document.getElementById('skillSelect').selectedIndex].text,
            date: date,
            time: time,
            type: type
        };
        
        // Add the new session to the UI
        addNewSession(newSession);
        
        // Show success message
        showNotification('Session scheduled successfully!', 'success');
        
        // Reset form
        document.getElementById('scheduleForm').reset();
        
        // Reset min date
        setMinDate();
    } else {
        // Show error message
        showNotification(response.message || 'Failed to schedule session', 'error');
    }
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
 * Update skill options based on selected partner
 */
function updateSkillOptions() {
    const partnerSelect = document.getElementById('partnerSelect');
    const skillSelect = document.getElementById('skillSelect');
    
    if (!partnerSelect || !skillSelect) return;
    
    const selectedPartner = partnerSelect.value;
    
    // In a real application, this would fetch skills from the server
    // For demo purposes, we'll just reset the skill select
    skillSelect.value = '';
}

/**
 * Initialize session management functionality
 */
function initSessionManagement() {
    // Handle cancel buttons
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    cancelButtons.forEach(button => {
        button.addEventListener('click', handleSessionCancellation);
    });
    
    // Handle join buttons
    const joinButtons = document.querySelectorAll('.btn-join');
    joinButtons.forEach(button => {
        button.addEventListener('click', handleSessionJoin);
    });
}

/**
 * Handle session cancellation
 * @param {Event} e - The click event
 */
function handleSessionCancellation(e) {
    const sessionCard = e.target.closest('.upcoming-session');
    
    if (confirm('Are you sure you want to cancel this session?')) {
        // In a real app, this would send a request to cancel the session
        sessionCard.style.opacity = '0';
        setTimeout(() => {
            sessionCard.style.display = 'none';
        }, 300);
        
        showNotification('Session cancelled successfully', 'info');
    }
}

/**
 * Handle session join
 * @param {Event} e - The click event
 */
function handleSessionJoin(e) {
    const sessionCard = e.target.closest('.upcoming-session');
    const sessionType = sessionCard.querySelector('.session-type').textContent.trim();
    
    if (sessionType === 'Online') {
        // In a real app, this would open the meeting link
        showNotification('Joining online meeting...', 'info');
    } else {
        // In a real app, this would show the location
        showNotification('Showing meeting location...', 'info');
    }
}

/**
 * Add a new session to the UI
 * @param {Object} session - The session object
 */
function addNewSession(session) {
    const sessionsContainer = document.querySelector('.schedule-card:last-child');
    if (!sessionsContainer) return;
    
    // Find the calendar placeholder
    const calendarPlaceholder = sessionsContainer.querySelector('.calendar-placeholder');
    if (!calendarPlaceholder) return;
    
    // Create new session element
    const newSessionElement = document.createElement('div');
    newSessionElement.className = 'upcoming-session';
    
    // Format date and time
    const formattedDate = formatDate(session.date);
    const formattedTime = formatTime(session.time);
    
    // Set session type class
    const sessionTypeClass = session.type === 'online' ? 'online' : 'in-person';
    const sessionTypeText = session.type === 'online' ? 'Online' : 'In-person';
    const joinButtonIcon = session.type === 'online' ? 'fa-video' : 'fa-map-marker-alt';
    const joinButtonText = session.type === 'online' ? 'Join Meeting' : 'View Location';
    
    // Generate avatar seed based on partner name
    const avatarSeed = session.partnerName.split(' ')[0].toLowerCase();
    
    // Create session HTML
    newSessionElement.innerHTML = `
        <div class="session-header">
            <img src="https://api.dicebear.com/6.x/avataaars/svg?seed=${avatarSeed}" alt="${session.partnerName}" class="session-avatar">
            <div>
                <h3 class="session-title">${session.skill} Session</h3>
                <p class="session-subtitle">with ${session.partnerName}</p>
            </div>
        </div>
        <div class="session-details">
            <div class="session-detail">
                <i class="far fa-calendar"></i>
                <span>${formattedDate}</span>
            </div>
            <div class="session-detail">
                <i class="far fa-clock"></i>
                <span>${formattedTime}</span>
            </div>
        </div>
        <span class="session-type ${sessionTypeClass}">${sessionTypeText}</span>
        <div class="session-actions">
            <button class="btn btn-session btn-join">
                <i class="fas ${joinButtonIcon} me-1"></i>${joinButtonText}
            </button>
            <button class="btn btn-session btn-cancel">
                <i class="fas fa-times me-1"></i>Cancel
            </button>
        </div>
    `;
    
    // Insert before calendar placeholder
    sessionsContainer.insertBefore(newSessionElement, calendarPlaceholder);
    
    // Add event listeners to new buttons
    const cancelButton = newSessionElement.querySelector('.btn-cancel');
    if (cancelButton) {
        cancelButton.addEventListener('click', handleSessionCancellation);
    }
    
    const joinButton = newSessionElement.querySelector('.btn-join');
    if (joinButton) {
        joinButton.addEventListener('click', handleSessionJoin);
    }
}

/**
 * Format date to a readable format
 * @param {string} dateString - The date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format time to a readable format
 * @param {string} timeString - The time string in HH:MM format
 * @returns {string} - Formatted time string
 */
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    // Add 1.5 hours for session duration (demo purposes)
    const endHour = (hour + 1) % 24;
    const endHour12 = endHour % 12 || 12;
    const endAmPm = endHour >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minutes} ${ampm} - ${endHour12}:${minutes} ${endAmPm}`;
}

/**
 * Add responsive behavior to the page
 */
function addResponsiveBehavior() {
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Initial call
    handleResize();
}

/**
 * Handle window resize events
 */
function handleResize() {
    const width = window.innerWidth;
    
    // Adjust layout based on screen size
    if (width < 768) {
        // Mobile adjustments
        document.querySelectorAll('.session-actions').forEach(actions => {
            actions.style.flexDirection = 'column';
        });
        
        document.querySelectorAll('.btn-session').forEach(btn => {
            btn.style.width = '100%';
        });
    } else {
        // Desktop adjustments
        document.querySelectorAll('.session-actions').forEach(actions => {
            actions.style.flexDirection = 'row';
        });
        
        document.querySelectorAll('.btn-session').forEach(btn => {
            btn.style.width = 'auto';
        });
    }
}

/**
 * Check if user arrived from accepting a connection request
 */
function checkForNewConnection() {
    const urlParams = new URLSearchParams(window.location.search);
    const newConnection = urlParams.get('new_connection');
    
    if (newConnection === 'true') {
        // Show welcome message
        showNotification('Connection accepted! Schedule your first session now.', 'success');
        
        // Highlight the form
        const scheduleForm = document.getElementById('scheduleForm');
        if (scheduleForm) {
            scheduleForm.classList.add('highlight-form');
            
            // Add highlight style if not already present
            if (!document.getElementById('highlight-form-style')) {
                const style = document.createElement('style');
                style.id = 'highlight-form-style';
                style.textContent = `
                    @keyframes pulse {
                        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                    }
                    
                    .highlight-form {
                        animation: pulse 2s infinite;
                        border: 2px solid #10B981;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Remove highlight after a delay
            setTimeout(() => {
                scheduleForm.classList.remove('highlight-form');
            }, 6000);
        }
        
        // Auto-select the first partner (simulating the newly connected user)
        const partnerSelect = document.getElementById('partnerSelect');
        if (partnerSelect && partnerSelect.options.length > 1) {
            partnerSelect.selectedIndex = 1; // Select the first actual partner
            
            // Trigger change event to update skill options
            const event = new Event('change');
            partnerSelect.dispatchEvent(event);
        }
        
        // Clean URL to prevent showing the message again on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Send session data to server
 * @param {Object} sessionData - The session data to send
 * @returns {Promise} - Promise resolving to the server response
 */
async function sendSessionRequest(sessionData) {
    try {
        // Show loading indicator
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-25';
        loadingSpinner.style.zIndex = '9999';
        loadingSpinner.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(loadingSpinner);
        
        // In a real app, this would be an actual API call
        // For demo purposes, we'll simulate the API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Remove loading spinner
                loadingSpinner.remove();
                
                // Simulate successful response
                resolve({
                    success: true,
                    message: 'Session scheduled successfully',
                    data: { 
                        ...sessionData,
                        id: Math.floor(Math.random() * 1000),
                        status: 'confirmed'
                    }
                });
            }, 1500);
        });
    } catch (error) {
        console.error('Error scheduling session:', error);
        return { success: false, message: 'Failed to schedule session' };
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // Create container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add styles for notification container
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .notification {
                padding: 15px 20px;
                margin-bottom: 10px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transform: translateX(100%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                max-width: 300px;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification.success {
                background-color: #10B981;
            }
            
            .notification.error {
                background-color: #EF4444;
            }
            
            .notification.info {
                background-color: #3B82F6;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 
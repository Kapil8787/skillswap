// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Mock API for development when backend is not available
const USE_MOCK_API = true; // Set to false when backend is available

// Authentication state
let currentUser = null;

// Check if user is already logged in
function redirectIfAuthenticated() {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Only redirect if we're on the login page and user is authenticated
    if (currentPage === 'login.html' && auth.isLoggedIn()) {
        // Add a flag to prevent redirect loops
        if (!sessionStorage.getItem('redirecting')) {
            sessionStorage.setItem('redirecting', 'true');
            window.location.href = 'dashboard.html';
            
            // Clear the flag after a short delay
            setTimeout(() => {
                sessionStorage.removeItem('redirecting');
            }, 2000);
        }
    }
}

// Authentication functions
const auth = {
    login: function(email, password) {
        if (USE_MOCK_API) {
            // Mock login for development
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simple validation
                    if (email && password) {
                        const mockUser = {
                            user_id: 1,
                            name: 'Test User',
                            email: email
                        };
                        const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
                        
                        // Store token and user data
                        localStorage.setItem('token', mockToken);
                        localStorage.setItem('currentUser', JSON.stringify(mockUser));
                        currentUser = mockUser;
                        
                        resolve({ success: true, message: 'Login successful' });
                    } else {
                        resolve({ success: false, message: 'Invalid email or password' });
                    }
                }, 500); // Simulate network delay
            });
        }
        
        // Real API call
        return fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store token and user data
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                currentUser = data.user;
                return { success: true, message: 'Login successful' };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        });
    },

    register: function(name, email, password) {
        if (USE_MOCK_API) {
            // Mock registration for development
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simple validation
                    if (name && email && password) {
                        // Create a mock user with the provided name
                        const mockUser = {
                            user_id: Math.floor(Math.random() * 1000) + 1,
                            name: name,
                            email: email
                        };
                        const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
                        
                        // Store token and user data
                        localStorage.setItem('token', mockToken);
                        localStorage.setItem('currentUser', JSON.stringify(mockUser));
                        currentUser = mockUser;
                        
                        resolve({ success: true, message: 'Registration successful' });
                    } else {
                        resolve({ success: false, message: 'Missing required fields' });
                    }
                }, 500); // Simulate network delay
            });
        }
        
        // Real API call
        return fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // After registration, log the user in
                return this.login(email, password);
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            return { success: false, message: 'An error occurred during registration' };
        });
    },

    loginWithGoogle: function() {
        window.location.href = `${API_BASE_URL}/login/google`;
    },

    logout: function() {
        // Show confirmation dialog
        if (confirm("Are you sure you want to log out?")) {
            // Clear user data
            currentUser = null;
            
            // Clear all authentication data from localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('email');
            localStorage.removeItem('auth_data');
            
            // Redirect to login page
            window.location.href = 'login.html';
        }
    },

    getCurrentUser: function() {
        if (!currentUser) {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
            }
        }
        return currentUser;
    },
    
    getToken: function() {
        return localStorage.getItem('token');
    },
    
    isLoggedIn: function() {
        return this.getToken() !== null && this.getCurrentUser() !== null;
    },
    
    // Clear redirect flag to prevent loops
    clearRedirectFlag: function() {
        sessionStorage.removeItem('redirecting');
    }
};

// Helper function for making authenticated API requests
function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Add authorization header if logged in
    if (auth.isLoggedIn()) {
        headers['Authorization'] = `Bearer ${auth.getToken()}`;
    }
    
    const options = {
        method: method,
        headers: headers
    };
    
    // Add body for POST, PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    return fetch(`${API_BASE_URL}${endpoint}`, options)
        .then(response => response.json())
        .catch(error => {
            console.error('API request error:', error);
            return { success: false, message: 'An error occurred during the request' };
        });
}

// Update UI based on authentication status
function updateAuthUI() {
    // Update navigation based on authentication status
    const authContainer = document.querySelector('.navbar-nav');
    if (authContainer) {
        const loginButtons = authContainer.querySelectorAll('.nav-item:last-child, .nav-item:nth-last-child(2)');
        loginButtons.forEach(button => {
            if (button.querySelector('a[href="login.html"]') || button.querySelector('a[href="login.html?mode=signup"]')) {
                button.style.display = auth.isLoggedIn() ? 'none' : 'block';
            }
        });
        
        // Add profile and logout links if logged in
        if (auth.isLoggedIn() && !document.querySelector('.nav-link[href="profile.html"]')) {
            const user = auth.getCurrentUser();
            const profileItem = document.createElement('li');
            profileItem.className = 'nav-item';
            profileItem.innerHTML = `<a class="nav-link" href="profile.html">My Profile</a>`;
            
            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item';
            logoutItem.innerHTML = `<button class="btn btn-outline-primary ms-2 logout">Logout</button>`;
            
            authContainer.appendChild(profileItem);
            authContainer.appendChild(logoutItem);
            
            // Add event listener to the new logout button
            logoutItem.querySelector('.logout').addEventListener('click', function(e) {
                e.preventDefault();
                auth.logout();
            });
        }
    }
}

// Check authentication state on page load and set up logout functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    // Set up logout button functionality
    const logoutButtons = document.querySelectorAll('.logout, .nav-link.logout, a.logout, button.logout');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
        });
    });
    
    // Check if current page requires authentication
    const protectedPages = [
        'dashboard.html', 'profile.html', 'settings.html', 
        'chat.html', 'matching.html', 'schedule.html',
        'feedback.html', 'requests.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // If this is a protected page and user is not logged in, redirect to login
    if (protectedPages.includes(currentPage) && !auth.isLoggedIn()) {
        window.location.href = 'login.html';
    }
    
    // Update UI based on authentication status
    updateAuthUI();
    
    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') && urlParams.has('user')) {
        const token = urlParams.get('token');
        const user = JSON.parse(decodeURIComponent(urlParams.get('user')));
        
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}); 
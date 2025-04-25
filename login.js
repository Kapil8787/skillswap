document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleLinks = document.querySelectorAll('.toggle-form');
    const googleLoginButtons = document.querySelectorAll('.google-login-btn');
    
    // Clear any redirect flags to prevent loops
    if (typeof auth !== 'undefined' && typeof auth.clearRedirectFlag === 'function') {
        auth.clearRedirectFlag();
    }
    
    // Check URL parameters for initial form display
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const error = urlParams.get('error');
    
    if (mode === 'signup') {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    }
    
    // Display error message if present
    if (error) {
        showError(decodeURIComponent(error));
        // Clean URL by removing error parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('error');
        window.history.replaceState({}, document.title, newUrl);
    }

    // Check if we're coming from a Google OAuth redirect
    // Reusing the urlParams variable declared above
    
    // Handle code parameter from OAuth flow
    if (urlParams.has('code')) {
        // Show loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'alert alert-info text-center';
        loadingDiv.textContent = 'Completing authentication, please wait...';
        document.querySelector('.form-container').prepend(loadingDiv);
        
        // Don't redirect or show forms while processing OAuth
        return;
    }
    
    // Handle token and user from OAuth redirect
    if (urlParams.has('token') && urlParams.has('user')) {
        // Handle OAuth redirect - don't redirect again
        const token = urlParams.get('token');
        const user = JSON.parse(decodeURIComponent(urlParams.get('user')));
        
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        return; // Stop execution to prevent redirect loop
    }
    
    // Only redirect if not in OAuth flow
    if (!urlParams.has('code')) {
        redirectIfAuthenticated();
    }

    // Toggle form visibility when clicking the links
    toggleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.toggle('active');
            signupForm.classList.toggle('active');
            // Clear any error messages when switching forms
            document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        });
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🔒';
        });
    });
    
    // Handle Google login
    googleLoginButtons.forEach(button => {
        button.addEventListener('click', function() {
            auth.loginWithGoogle();
        });
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        auth.login(email, password)
            .then(result => {
                if (result.success) {
                    window.location.href = 'dashboard.html';
                } else {
                    showError(result.message || 'Invalid email or password');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showError('Login failed. Please try again.');
            })
            .finally(() => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
    });

    // Password validation function
    function validatePassword(password) {
        const errors = [];
        
        // Check if first letter is capitalized
        if (!/^[A-Z]/.test(password)) {
            errors.push("Password must start with a capital letter");
        }
        
        // Check if password contains at least one number
        if (!/\d/.test(password)) {
            errors.push("Password must contain at least one number");
        }
        
        // Check if password contains at least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push("Password must contain at least one special character");
        }
        
        return errors;
    }
    
    // Add password validation on input
    const signupPasswordInput = signupForm.querySelector('input[name="password"]');
    signupPasswordInput.addEventListener('input', function() {
        // Remove any existing password validation messages
        const existingValidation = document.getElementById('password-validation');
        if (existingValidation) {
            existingValidation.remove();
        }
        
        const password = this.value;
        if (password.length > 0) {
            const errors = validatePassword(password);
            
            if (errors.length > 0) {
                // Create validation message container
                const validationDiv = document.createElement('div');
                validationDiv.id = 'password-validation';
                validationDiv.className = 'password-validation alert alert-warning mt-2';
                
                // Add each error as a separate line
                errors.forEach(error => {
                    const errorLine = document.createElement('p');
                    errorLine.className = 'mb-1';
                    errorLine.textContent = error;
                    validationDiv.appendChild(errorLine);
                });
                
                // Insert after password field
                this.parentNode.appendChild(validationDiv);
            }
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = this.querySelector('input[name="name"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;
        
        // Validate password before submission
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            showError('Please fix the password issues: ' + passwordErrors.join(', '));
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';

        auth.register(name, email, password)
            .then(result => {
                if (result.success) {
                    // Store user name in localStorage for easy access across pages
                    const user = {
                        name: name,
                        email: email
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    showError(result.message || 'Registration failed. Please check your inputs.');
                }
            })
            .catch(error => {
                console.error('Registration error:', error);
                showError('Registration failed. Please try again.');
            })
            .finally(() => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
    });
});

function showError(message) {
    // Remove any existing error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message alert alert-danger';
    errorDiv.textContent = message;
    
    // Insert the error message at the top of the active form
    const activeForm = document.querySelector('.auth-form.active');
    activeForm.insertBefore(errorDiv, activeForm.firstChild);
    
    // Remove the error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

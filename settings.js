/**
 * SkillSwap - Settings Page
 * JavaScript Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings functionality
    initializeSettings();
});

/**
 * Initialize all settings page functionality
 */
function initializeSettings() {
    // Get form elements
    const settingsForm = document.getElementById('settingsForm');
    const photoUpload = document.getElementById('photoUpload');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const enable2FABtn = document.getElementById('enable2FABtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');

    // Initialize modals
    const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    const twoFactorModal = new bootstrap.Modal(document.getElementById('twoFactorModal'));

    // Handle profile photo upload
    if (photoUpload) {
        photoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const profilePhoto = document.getElementById('profilePhoto');
                    if (profilePhoto) {
                        profilePhoto.src = e.target.result;
                    }
                    // Save to localStorage
                    localStorage.setItem('profilePhoto', e.target.result);
                    
                    // Update sidebar avatar
                    const sidebarAvatar = document.querySelector('.sidebar-footer .user-profile .avatar');
                    if (sidebarAvatar) {
                        sidebarAvatar.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle password change
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            passwordModal.show();
        });
    }

    // Handle 2FA setup
    if (enable2FABtn) {
        enable2FABtn.addEventListener('click', function() {
            twoFactorModal.show();
        });
    }

    // Handle data export
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            exportUserData();
        });
    }

    // Handle form submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });
    }
    
    // Handle save changes button click
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveSettings();
        });
    }

    // Load saved settings
    loadSavedSettings();
}

function saveSettings() {
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const bio = document.getElementById('bio').value;
    const location = document.getElementById('location').value;
    const linkedinUrl = document.getElementById('linkedinUrl').value;
    const githubUrl = document.getElementById('githubUrl').value;
    const twitterUrl = document.getElementById('twitterUrl').value;
    const otherUrl = document.getElementById('otherUrl').value;
    const otherUrlLabel = document.getElementById('otherUrlLabel').value;
    const skillsOffered = Array.from(document.getElementById('skillsOffered').selectedOptions).map(option => option.value);
    const skillsWanted = Array.from(document.getElementById('skillsWanted').selectedOptions).map(option => option.value);
    
    // Get availability settings
    const availability = {
        days: {
            monday: document.getElementById('monday').checked,
            tuesday: document.getElementById('tuesday').checked,
            wednesday: document.getElementById('wednesday').checked,
            thursday: document.getElementById('thursday').checked,
            friday: document.getElementById('friday').checked,
            saturday: document.getElementById('saturday').checked,
            sunday: document.getElementById('sunday').checked
        },
        times: {
            morning: document.getElementById('morning').checked,
            afternoon: document.getElementById('afternoon').checked,
            evening: document.getElementById('evening').checked,
            night: document.getElementById('night').checked
        }
    };

    // Get notification preferences
    const notifications = {
        email: document.getElementById('emailNotifications').checked,
        sessionReminders: document.getElementById('sessionReminders').checked,
        feedbackAlerts: document.getElementById('feedbackAlerts').checked,
        matchSuggestions: document.getElementById('matchSuggestions').checked,
        marketingEmails: document.getElementById('marketingEmails').checked
    };

    // Get privacy settings
    const privacy = {
        publicProfile: document.getElementById('publicProfile').checked,
        showEmail: document.getElementById('showEmail').checked
    };

    // Social media links
    const socialMedia = {
        linkedin: linkedinUrl,
        github: githubUrl,
        twitter: twitterUrl,
        other: otherUrl,
        otherLabel: otherUrlLabel || 'Website'
    };

    // Create settings object
    const settings = {
        name,
        email,
        bio,
        location,
        socialMedia,
        skillsOffered,
        skillsWanted,
        availability,
        notifications,
        privacy,
        // Add username for profile page
        username: '@' + name.toLowerCase().replace(/\s+/g, '')
    };

    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Also save as currentUser for broader compatibility
    localStorage.setItem('currentUser', JSON.stringify({
        name: name,
        email: email,
        photo: localStorage.getItem('profilePhoto')
    }));

    // Update sidebar profile information
    updateSidebarProfile(name);

    // Show success message
    showSuccessMessage('Settings saved successfully!');
}

// Function to update sidebar profile information
function updateSidebarProfile(name) {
    if (!name) return;
    
    // Update the name in the sidebar footer
    const sidebarUserName = document.querySelector('.sidebar-footer .user-info h6');
    if (sidebarUserName) {
        sidebarUserName.textContent = name;
    }
    
    // Update "View Profile" link to make it clickable
    const viewProfileLink = document.querySelector('.sidebar-footer .user-profile');
    if (viewProfileLink) {
        // Make the entire user profile area clickable
        viewProfileLink.style.cursor = 'pointer';
        viewProfileLink.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    // Update profile photo if it exists in localStorage
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
        const sidebarAvatar = document.querySelector('.sidebar-footer .user-profile .avatar');
        if (sidebarAvatar) {
            sidebarAvatar.src = savedPhoto;
        }
    }
    
    // Also update any other instances of the user name on the page
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = name;
    });
}

function loadSavedSettings() {
    // First try to load from userSettings
    const savedSettings = localStorage.getItem('userSettings');
    // Also check currentUser as a fallback
    const currentUser = localStorage.getItem('currentUser');
    
    // Initialize with empty values
    let name = '';
    let email = '';
    
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        name = settings.name || '';
        email = settings.email || '';
        
        // Update form fields
        document.getElementById('name').value = name;
        document.getElementById('email').value = email;
        
        // Update bio and location
        if (document.getElementById('bio')) {
            document.getElementById('bio').value = settings.bio || 'Passionate about technology and education. I love sharing knowledge and learning from others. Currently working as a software developer and teaching web development on SkillSwap.';
        }
        
        if (document.getElementById('location')) {
            document.getElementById('location').value = settings.location || 'San Francisco, CA';
        }
        
        // Update social media links
        if (settings.socialMedia) {
            if (document.getElementById('linkedinUrl')) {
                document.getElementById('linkedinUrl').value = settings.socialMedia.linkedin || '';
            }
            if (document.getElementById('githubUrl')) {
                document.getElementById('githubUrl').value = settings.socialMedia.github || '';
            }
            if (document.getElementById('twitterUrl')) {
                document.getElementById('twitterUrl').value = settings.socialMedia.twitter || '';
            }
            if (document.getElementById('otherUrl')) {
                document.getElementById('otherUrl').value = settings.socialMedia.other || '';
            }
            if (document.getElementById('otherUrlLabel')) {
                document.getElementById('otherUrlLabel').value = settings.socialMedia.otherLabel || '';
            }
        }
        
        // Update skills
        if (settings.skillsOffered) {
            settings.skillsOffered.forEach(skill => {
                const option = document.querySelector(`#skillsOffered option[value="${skill}"]`);
                if (option) option.selected = true;
            });
        }
        
        if (settings.skillsWanted) {
            settings.skillsWanted.forEach(skill => {
                const option = document.querySelector(`#skillsWanted option[value="${skill}"]`);
                if (option) option.selected = true;
            });
        }

        // Update availability
        if (settings.availability) {
            Object.entries(settings.availability.days).forEach(([day, checked]) => {
                const checkbox = document.getElementById(day);
                if (checkbox) checkbox.checked = checked;
            });

            Object.entries(settings.availability.times).forEach(([time, checked]) => {
                const checkbox = document.getElementById(time);
                if (checkbox) checkbox.checked = checked;
            });
        }

        // Update notifications
        if (settings.notifications) {
            Object.entries(settings.notifications).forEach(([key, checked]) => {
                const checkbox = document.getElementById(key + 'Notifications');
                if (checkbox) checkbox.checked = checked;
            });
        }

        // Update privacy
        if (settings.privacy) {
            document.getElementById('publicProfile').checked = settings.privacy.publicProfile;
            document.getElementById('showEmail').checked = settings.privacy.showEmail;
        }
        
        // Update sidebar profile information
        updateSidebarProfile(settings.name);
    }
    // If userSettings not found, try to use currentUser
    else if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // Update form fields with user data
        if (user.name) {
            document.getElementById('name').value = user.name;
            name = user.name;
        }
        
        if (user.email) {
            document.getElementById('email').value = user.email;
            email = user.email;
        }
        
        // Update sidebar profile information
        updateSidebarProfile(user.name);
    }

    // Load profile photo if exists
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
        const profilePhoto = document.getElementById('profilePhoto');
        if (profilePhoto) {
            profilePhoto.src = savedPhoto;
        }
    }
}

function showSuccessMessage(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.appendChild(toast);
    document.body.appendChild(container);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        container.remove();
    });
}

function exportUserData() {
    const settings = localStorage.getItem('userSettings');
    if (settings) {
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'skillswap-user-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
} 
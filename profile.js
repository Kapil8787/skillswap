document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile functionality
    initializeProfile();
});

function initializeProfile() {
    // Load profile data from settings
    loadProfileFromSettings();
}

function loadProfileFromSettings() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    const currentUser = localStorage.getItem('currentUser');
    
    // First try to load from userSettings
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Update profile name
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = settings.name || 'Alex Thompson';
        }
        
        // Update profile username (if exists in settings)
        const profileUsername = document.querySelector('.profile-username');
        if (profileUsername) {
            profileUsername.textContent = settings.username || '@' + (settings.name || 'alexthompson').toLowerCase().replace(/\s+/g, '');
        }
        
        // Update profile location
        const profileLocation = document.querySelector('.profile-location');
        if (profileLocation) {
            profileLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${settings.location || 'San Francisco, CA'}`;
        }
        
        // Update profile bio
        const profileBio = document.querySelector('.profile-bio');
        if (profileBio) {
            profileBio.textContent = settings.bio || 'Passionate about technology and education. I love sharing knowledge and learning from others. Currently working as a software developer and teaching web development on SkillSwap.';
        }
        
        // Update social media links
        if (settings.socialMedia) {
            updateSocialMediaLinks(settings.socialMedia);
        }
        
        // Update skills section
        if (settings.skillsOffered || settings.skillsWanted) {
            updateSkillsSection(settings.skillsOffered, settings.skillsWanted);
        }
        
        // Update availability section
        if (settings.availability) {
            updateAvailabilitySection(settings.availability);
        }
        
        // Update sidebar user info
        updateSidebarUserInfo(settings.name);
    }
    // If userSettings not found, try to use currentUser
    else if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // Update profile name
        const profileName = document.querySelector('.profile-name');
        if (profileName && user.name) {
            profileName.textContent = user.name;
        }
        
        // Update profile username
        const profileUsername = document.querySelector('.profile-username');
        if (profileUsername && user.name) {
            profileUsername.textContent = '@' + user.name.toLowerCase().replace(/\s+/g, '');
        }
        
        // Update sidebar user info
        updateSidebarUserInfo(user.name);
    }
    
    // Load profile photo
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
        // Update profile avatar
        const avatarImg = document.querySelector('.avatar-img');
        if (avatarImg) {
            avatarImg.src = savedPhoto;
        }
        
        // Update sidebar avatar
        const sidebarAvatar = document.querySelector('.sidebar-footer .user-profile .avatar');
        if (sidebarAvatar) {
            sidebarAvatar.src = savedPhoto;
        }
    }
    
    // Load cover photo
    const savedCoverPhoto = localStorage.getItem('coverPhoto');
    if (savedCoverPhoto) {
        const coverPhoto = document.querySelector('.cover-photo');
        if (coverPhoto) {
            coverPhoto.src = savedCoverPhoto;
        }
    }
}

// Function to update sidebar user info
function updateSidebarUserInfo(name) {
    if (!name) return;
    
    // Update the name in the sidebar footer
    const sidebarUserName = document.querySelector('.sidebar-footer .user-info h6');
    if (sidebarUserName) {
        sidebarUserName.textContent = name;
    }
}

function updateSkillsSection(skillsOffered, skillsWanted) {
    // Update skills offered
    const skillsOfferedList = document.querySelector('.skills-list:first-of-type');
    if (skillsOfferedList && skillsOffered && skillsOffered.length > 0) {
        skillsOfferedList.innerHTML = skillsOffered.map(skill => `
            <span class="skill-tag">
                <i class="fab fa-${getSkillIcon(skill)}"></i>
                ${formatSkillName(skill)}
            </span>
        `).join('');
    }

    // Update skills wanted
    const skillsWantedList = document.querySelector('.skills-list:last-of-type');
    if (skillsWantedList && skillsWanted && skillsWanted.length > 0) {
        skillsWantedList.innerHTML = skillsWanted.map(skill => `
            <span class="skill-tag wanted">
                <i class="fas fa-${getSkillIcon(skill)}"></i>
                ${formatSkillName(skill)}
            </span>
        `).join('');
    }
}

function updateAvailabilitySection(availability) {
    // Update available days
    const availableDays = Object.entries(availability.days)
        .filter(([_, checked]) => checked)
        .map(([day]) => day.substring(0, 3).toUpperCase());

    const daysList = document.querySelector('.availability-days');
    if (daysList && availableDays.length > 0) {
        daysList.innerHTML = availableDays.map(day => `
            <span class="day-tag">${day}</span>
        `).join('');
    }

    // Update available times
    const availableTimes = Object.entries(availability.times)
        .filter(([_, checked]) => checked)
        .map(([time]) => formatTimeSlot(time));

    const timesList = document.querySelector('.availability-times');
    if (timesList && availableTimes.length > 0) {
        timesList.innerHTML = availableTimes.map(time => `
            <span class="time-tag">${time}</span>
        `).join('');
    }
}

function getSkillIcon(skill) {
    const icons = {
        'javascript': 'js',
        'react': 'react',
        'python': 'python',
        'html': 'html5',
        'css': 'css3',
        'node-js': 'node-js',
        'data-science': 'database',
        'ui-ux': 'paint-brush',
        'spanish': 'language'
    };
    return icons[skill] || 'code';
}

function formatSkillName(skill) {
    return skill.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatTimeSlot(time) {
    const timeSlots = {
        'morning': 'Morning (6AM - 12PM)',
        'afternoon': 'Afternoon (12PM - 5PM)',
        'evening': 'Evening (5PM - 10PM)',
        'night': 'Night (10PM - 6AM)'
    };
    return timeSlots[time] || time;
}

function updateSocialMediaLinks(socialMedia) {
    const socialLinksContainer = document.querySelector('.profile-social');
    if (!socialLinksContainer) return;
    
    // Clear existing links
    socialLinksContainer.innerHTML = '';
    
    // Add LinkedIn link if provided
    if (socialMedia.linkedin) {
        const linkedinLink = document.createElement('a');
        linkedinLink.href = socialMedia.linkedin;
        linkedinLink.className = 'social-link';
        linkedinLink.title = 'LinkedIn';
        linkedinLink.target = '_blank';
        linkedinLink.innerHTML = '<i class="fab fa-linkedin"></i>';
        socialLinksContainer.appendChild(linkedinLink);
    }
    
    // Add GitHub link if provided
    if (socialMedia.github) {
        const githubLink = document.createElement('a');
        githubLink.href = socialMedia.github;
        githubLink.className = 'social-link';
        githubLink.title = 'GitHub';
        githubLink.target = '_blank';
        githubLink.innerHTML = '<i class="fab fa-github"></i>';
        socialLinksContainer.appendChild(githubLink);
    }
    
    // Add Twitter link if provided
    if (socialMedia.twitter) {
        const twitterLink = document.createElement('a');
        twitterLink.href = socialMedia.twitter;
        twitterLink.className = 'social-link';
        twitterLink.title = 'Twitter';
        twitterLink.target = '_blank';
        twitterLink.innerHTML = '<i class="fab fa-twitter"></i>';
        socialLinksContainer.appendChild(twitterLink);
    }
    
    // Add Other link if provided
    if (socialMedia.other) {
        const otherLink = document.createElement('a');
        otherLink.href = socialMedia.other;
        otherLink.className = 'social-link';
        otherLink.title = socialMedia.otherLabel || 'Website';
        otherLink.target = '_blank';
        otherLink.innerHTML = '<i class="fas fa-globe"></i>';
        socialLinksContainer.appendChild(otherLink);
    }
    
    // If no social media links provided, add default empty links
    if (!socialMedia.linkedin && !socialMedia.github && !socialMedia.twitter && !socialMedia.other) {
        socialLinksContainer.innerHTML = `
            <a href="#" class="social-link" title="LinkedIn">
                <i class="fab fa-linkedin"></i>
            </a>
            <a href="#" class="social-link" title="GitHub">
                <i class="fab fa-github"></i>
            </a>
            <a href="#" class="social-link" title="Twitter">
                <i class="fab fa-twitter"></i>
            </a>
        `;
    }
} 
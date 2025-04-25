/**
 * SkillSwap - Common JavaScript Functions
 * Shared functionality across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Update user information in the sidebar
    updateSidebarUserInfo();
    
    // Initialize sidebar toggle for mobile
    initializeSidebarToggle();
});

/**
 * Update user information in the sidebar
 */
function updateSidebarUserInfo() {
    // Get current user from auth
    const user = auth.getCurrentUser();
    if (!user) return;
    
    // Update username in sidebar
    const sidebarUserName = document.querySelector('.sidebar-footer .user-info h6');
    if (sidebarUserName) {
        sidebarUserName.textContent = user.name || 'User';
    }
    
    // Update avatar if available
    if (user.photo) {
        const sidebarAvatar = document.querySelector('.sidebar-footer .user-profile .avatar');
        if (sidebarAvatar) {
            sidebarAvatar.src = user.photo;
        }
    } else {
        // Check if there's a profilePhoto in localStorage
        const profilePhoto = localStorage.getItem('profilePhoto');
        if (profilePhoto) {
            const sidebarAvatar = document.querySelector('.sidebar-footer .user-profile .avatar');
            if (sidebarAvatar) {
                sidebarAvatar.src = profilePhoto;
            }
        }
    }
}

/**
 * Initialize sidebar toggle for mobile
 */
function initializeSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.add('show');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            sidebar.classList.remove('show');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 992 && 
            sidebar && sidebar.classList.contains('show') && 
            !sidebar.contains(e.target) && 
            toggleBtn && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });
}
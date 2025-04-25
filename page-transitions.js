/**
 * SkillSwap - Page Transitions and Performance Optimization
 * Handles smooth page transitions and improves loading performance
 */

// Cache for storing pre-loaded pages
const pageCache = new Map();

// Configuration
const config = {
    // Pages to preload when idle
    pagesToPreload: [
        'dashboard.html',
        'profile.html',
        'matching.html',
        'chat.html',
        'schedule.html',
        'feedback.html',
        'settings.html',
        'verification.html'
    ],
    // Transition animation duration in ms
    transitionDuration: 300,
    // Delay before showing loading indicator
    loadingIndicatorDelay: 200
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth page transitions
    initPageTransitions();
    
    // Preload common pages when browser is idle
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => preloadPages());
    } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => preloadPages(), 2000);
    }
});

/**
 * Initialize smooth page transitions
 */
function initPageTransitions() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link:not(.logout)');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip if it's not a page link or is external
        if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto:')) {
            return;
        }
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Don't transition if it's the current page
            if (window.location.pathname.endsWith(href)) {
                return;
            }
            
            // Start transition
            navigateToPage(href);
        });
    });
}

/**
 * Navigate to a new page with smooth transition
 * @param {string} url - The URL to navigate to
 */
function navigateToPage(url) {
    // Show loading indicator
    const loadingTimer = setTimeout(() => {
        showLoadingIndicator();
    }, config.loadingIndicatorDelay);
    
    // Check if page is in cache
    if (pageCache.has(url)) {
        clearTimeout(loadingTimer);
        transitionToPage(url, pageCache.get(url));
        return;
    }
    
    // Fetch the page
    fetch(url)
        .then(response => response.text())
        .then(html => {
            clearTimeout(loadingTimer);
            hideLoadingIndicator();
            
            // Cache the page
            pageCache.set(url, html);
            
            // Transition to the new page
            transitionToPage(url, html);
        })
        .catch(error => {
            clearTimeout(loadingTimer);
            hideLoadingIndicator();
            console.error('Navigation error:', error);
            
            // Fallback to traditional navigation
            window.location.href = url;
        });
}

/**
 * Transition to a new page
 * @param {string} url - The URL to navigate to
 * @param {string} html - The HTML content of the new page
 */
function transitionToPage(url, html) {
    // Create a temporary container to parse the HTML
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');
    
    // Get the main content from the new page
    const newMainContent = newDoc.querySelector('.main-content');
    
    if (!newMainContent) {
        // Fallback to traditional navigation if structure is different
        window.location.href = url;
        return;
    }
    
    // Get the current main content
    const currentMainContent = document.querySelector('.main-content');
    
    // Fade out current content
    currentMainContent.style.opacity = '0';
    currentMainContent.style.transition = `opacity ${config.transitionDuration}ms ease`;
    
    // After fade out, update content and fade in
    setTimeout(() => {
        // Update page title
        document.title = newDoc.title;
        
        // Update the main content
        currentMainContent.innerHTML = newMainContent.innerHTML;
        
        // Update active navigation item
        updateActiveNavItem(url);
        
        // Fade in new content
        currentMainContent.style.opacity = '1';
        
        // Update browser history
        window.history.pushState({}, '', url);
        
        // Reinitialize any scripts needed for the new page
        reinitializePageScripts(url);
    }, config.transitionDuration);
}

/**
 * Update active navigation item
 * @param {string} url - The current URL
 */
function updateActiveNavItem(url) {
    // Remove active class from all nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the current page's nav item
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref && url.endsWith(linkHref)) {
            link.closest('.nav-item').classList.add('active');
        }
    });
}

/**
 * Reinitialize scripts for the new page
 * @param {string} url - The URL of the new page
 */
function reinitializePageScripts(url) {
    // Common initialization for all pages
    if (typeof initializeSidebarToggle === 'function') {
        initializeSidebarToggle();
    }
    
    if (typeof initializeUserProfile === 'function') {
        initializeUserProfile();
    }
    
    // Page-specific initializations
    if (url.includes('chat.html') && typeof initializeChat === 'function') {
        initializeChat();
    } else if (url.includes('profile.html') && typeof initializeProfile === 'function') {
        initializeProfile();
    } else if (url.includes('matching.html') && typeof initializeMatching === 'function') {
        initializeMatching();
    } else if (url.includes('schedule.html') && typeof initializeSchedule === 'function') {
        initializeSchedule();
    }
    
    // Dispatch a custom event that page-specific scripts can listen for
    document.dispatchEvent(new CustomEvent('pageTransitionComplete', { detail: { url } }));
}

/**
 * Preload common pages
 */
function preloadPages() {
    config.pagesToPreload.forEach(url => {
        // Skip current page
        if (window.location.pathname.endsWith(url)) {
            return;
        }
        
        // Skip if already cached
        if (pageCache.has(url)) {
            return;
        }
        
        // Fetch and cache the page
        fetch(url)
            .then(response => response.text())
            .then(html => {
                pageCache.set(url, html);
                console.log(`Preloaded: ${url}`);
            })
            .catch(error => {
                console.error(`Failed to preload ${url}:`, error);
            });
    });
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    // Check if loading indicator already exists
    if (document.querySelector('.page-loading-indicator')) {
        return;
    }
    
    // Create loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'page-loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(loadingIndicator);
    
    // Fade in
    setTimeout(() => {
        loadingIndicator.style.opacity = '1';
    }, 10);
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('.page-loading-indicator');
    
    if (loadingIndicator) {
        // Fade out
        loadingIndicator.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => {
            loadingIndicator.remove();
        }, 300);
    }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
    const url = window.location.pathname;
    
    // Check if page is in cache
    if (pageCache.has(url)) {
        transitionToPage(url, pageCache.get(url));
    } else {
        // Reload the page if not in cache
        window.location.reload();
    }
});
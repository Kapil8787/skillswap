/**
 * SkillSwap - Performance Optimizations
 * Handles various performance optimizations for faster page loading and smoother experience
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize performance optimizations
    initPerformanceOptimizations();
});

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
    // Lazy load images that are not in the viewport
    lazyLoadImages();
    
    // Defer non-critical JavaScript
    deferNonCriticalJS();
    
    // Add page transition class to enable CSS transitions
    document.body.classList.add('transitions-enabled');
    
    // Optimize event handlers
    optimizeEventHandlers();
    
    // Preconnect to external domains
    preconnectToExternalDomains();
}

/**
 * Lazy load images that are not in the viewport
 */
function lazyLoadImages() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the image is in the viewport
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Set the src attribute to load the image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Stop observing the image
                    observer.unobserve(img);
                }
            });
        });
        
        // Get all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Defer loading of non-critical JavaScript
 */
function deferNonCriticalJS() {
    // Get all script tags with data-defer attribute
    const deferredScripts = document.querySelectorAll('script[data-defer]');
    
    // Load deferred scripts after page load
    if (deferredScripts.length > 0) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                deferredScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    
                    // Copy all attributes
                    Array.from(script.attributes).forEach(attr => {
                        if (attr.name !== 'data-defer') {
                            newScript.setAttribute(attr.name, attr.value);
                        }
                    });
                    
                    // Copy inline script content
                    if (script.innerHTML) {
                        newScript.innerHTML = script.innerHTML;
                    }
                    
                    // Replace the original script tag
                    script.parentNode.replaceChild(newScript, script);
                });
            }, 100);
        });
    }
}

/**
 * Optimize event handlers to improve performance
 */
function optimizeEventHandlers() {
    // Use event delegation for common events
    document.addEventListener('click', function(e) {
        // Handle button clicks
        if (e.target.matches('.btn') || e.target.closest('.btn')) {
            // Add a subtle feedback effect
            const button = e.target.matches('.btn') ? e.target : e.target.closest('.btn');
            
            // Add a ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            button.appendChild(ripple);
            
            // Position the ripple
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            
            // Remove the ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
    
    // Throttle scroll and resize events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function() {
                scrollTimeout = null;
                // Handle scroll events here
            }, 100);
        }
    });
    
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(function() {
                resizeTimeout = null;
                // Handle resize events here
            }, 100);
        }
    });
}

/**
 * Preconnect to external domains to improve loading performance
 */
function preconnectToExternalDomains() {
    // List of domains to preconnect to
    const domains = [
        'https://cdn.jsdelivr.net',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com',
        'https://api.dicebear.com'
    ];
    
    // Create link elements for preconnect
    domains.forEach(domain => {
        if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    });
}

// Add CSS for button ripple effect
const style = document.createElement('style');
style.textContent = `
.btn-ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.btn {
    position: relative;
    overflow: hidden;
}

.transitions-enabled * {
    transition-property: opacity, transform, color, background-color, border-color;
    transition-duration: 0.3s;
    transition-timing-function: ease;
}
`;
document.head.appendChild(style);
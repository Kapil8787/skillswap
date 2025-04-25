// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Default testimonials in case API fails
const defaultTestimonials = [
    {
        text: "SkillSwap helped me learn Spanish while teaching programming. It's amazing how many talented people are willing to exchange knowledge!",
        name: "John Doe",
        role: "Web Developer",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=1"
    },
    {
        text: "The platform made it easy to find someone to exchange photography lessons for my graphic design skills. Highly recommended!",
        name: "Jane Smith",
        role: "Graphic Designer",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=2"
    }
];

// Load testimonials from API or use defaults
function loadTestimonials() {
    const container = document.getElementById('testimonials-container');
    
    // Try to fetch testimonials from API
    fetch(`${API_BASE_URL}/api/testimonials`)
        .then(response => response.json())
        .then(data => {
            const testimonials = data.success ? data.testimonials : defaultTestimonials;
            renderTestimonials(testimonials, container);
        })
        .catch(error => {
            console.error('Error fetching testimonials:', error);
            renderTestimonials(defaultTestimonials, container);
        });
}

// Render testimonials to the container
function renderTestimonials(testimonials, container) {
    container.innerHTML = ''; // Clear container
    
    testimonials.forEach(testimonial => {
        const avatar = testimonial.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${testimonial.name}`;
        const testimonialHTML = `
            <div class="col-md-6">
                <div class="testimonial-card">
                    <p class="mb-3">"${testimonial.text}"</p>
                    <div class="d-flex align-items-center">
                        <img src="${avatar}" alt="${testimonial.name}" class="testimonial-avatar">
                        <div class="ms-3">
                            <h5 class="mb-0">${testimonial.name}</h5>
                            <small class="text-muted">${testimonial.role || 'SkillSwap User'}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += testimonialHTML;
    });
}

// Smooth scroll for navigation
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation based on authentication status
    updateNavigation();
    
    // Handle navbar background on scroll
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar.offsetHeight;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // Handle smooth scrolling for all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#top') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.offsetTop - navbarHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Handle mobile menu closing after click
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) { // Bootstrap's lg breakpoint
                navbarCollapse.classList.remove('show');
                navbarToggler.classList.add('collapsed');
            }
        });
    });

    loadTestimonials();
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'white';
        navbar.style.backdropFilter = 'none';
    }
});

// Update navigation based on authentication status
function updateNavigation() {
    // Check if auth.js is loaded
    if (typeof auth !== 'undefined') {
        const navbarNav = document.querySelector('.navbar-nav');
        const signUpButton = document.querySelector('.nav-item .btn-primary');
        const browseButton = document.querySelector('a[href="login.html"].btn-outline-light');
        
        if (auth.isLoggedIn()) {
            // User is logged in
            const user = auth.getCurrentUser();
            
            // Update sign up button to profile link
            if (signUpButton) {
                const parentItem = signUpButton.closest('.nav-item');
                parentItem.innerHTML = `<a class="nav-link" href="profile.html">My Profile</a>`;
            }
            
            // Update browse skills button to dashboard link
            if (browseButton) {
                browseButton.href = 'dashboard.html';
                browseButton.textContent = 'Dashboard';
            }
            
            // Add logout button if it doesn't exist
            if (!document.querySelector('.logout-btn')) {
                const logoutItem = document.createElement('li');
                logoutItem.className = 'nav-item';
                logoutItem.innerHTML = `<button class="btn btn-outline-primary ms-2 logout-btn">Logout</button>`;
                navbarNav.appendChild(logoutItem);
                
                // Add event listener to logout button
                logoutItem.querySelector('.logout-btn').addEventListener('click', function() {
                    auth.logout();
                });
            }
        } else {
            // User is not logged in - make sure links point to login
            if (browseButton) {
                browseButton.href = 'login.html';
                browseButton.textContent = 'Browse Skills';
            }
        }
    }
}

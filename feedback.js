/**
 * SkillSwap - Community & Feedback Page Scripts
 * Handles interactive functionality and dynamic content
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeRatingSelector();
    initializeDiscussionToggles();
    initializeModals();
});

/**
 * Initialize the star rating selector
 */
function initializeRatingSelector() {
    const ratingStars = document.querySelectorAll('.rating-selector i');
    const ratingInput = document.getElementById('reviewRating');
    
    if (ratingStars.length && ratingInput) {
        ratingStars.forEach(star => {
            // Hover effect
            star.addEventListener('mouseover', () => {
                const rating = star.getAttribute('data-rating');
                updateStars(rating, true);
            });
            
            // Mouse out effect
            star.addEventListener('mouseout', () => {
                const currentRating = ratingInput.value;
                updateStars(currentRating, false);
            });
            
            // Click effect
            star.addEventListener('click', () => {
                const rating = star.getAttribute('data-rating');
                ratingInput.value = rating;
                updateStars(rating, false);
            });
        });
    }
}

/**
 * Update the star display based on rating
 */
function updateStars(rating, isHover) {
    const stars = document.querySelectorAll('.rating-selector i');
    const ratingInput = document.getElementById('reviewRating');
    
    stars.forEach(star => {
        const starRating = star.getAttribute('data-rating');
        
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas');
            
            if (isHover) {
                star.classList.add('text-warning');
            } else {
                star.classList.remove('text-warning');
            }
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
            star.classList.remove('text-warning');
        }
    });
}

/**
 * Initialize discussion toggles
 */
function initializeDiscussionToggles() {
    const discussionToggles = document.querySelectorAll('.discussion-toggle');
    
    discussionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-bs-target');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Toggle the collapse state
                const isCollapsed = target.classList.contains('show');
                
                // Update button text
                if (isCollapsed) {
                    toggle.textContent = 'View Discussion';
                } else {
                    toggle.textContent = 'Hide Discussion';
                }
            }
        });
    });
}

/**
 * Initialize modals
 */
function initializeModals() {
    // Review submission
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('click', () => {
            const rating = document.getElementById('reviewRating').value;
            const title = document.getElementById('reviewTitle').value;
            const text = document.getElementById('reviewText').value;
            
            if (rating === '0') {
                alert('Please select a rating');
                return;
            }
            
            if (!title || !text) {
                alert('Please fill in all required fields');
                return;
            }
            
            // In a real application, this would submit to a server
            console.log('Submitting review:', { rating, title, text });
            
            // Show success message
            alert('Thank you for your review!');
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
            if (modal) {
                modal.hide();
            }
        });
    }
    
    // Discussion submission
    const submitDiscussionBtn = document.getElementById('submitDiscussionBtn');
    if (submitDiscussionBtn) {
        submitDiscussionBtn.addEventListener('click', () => {
            const title = document.getElementById('discussionTitle').value;
            const text = document.getElementById('discussionText').value;
            const category = document.getElementById('discussionCategory').value;
            
            if (!title || !text) {
                alert('Please fill in all required fields');
                return;
            }
            
            // In a real application, this would submit to a server
            console.log('Submitting discussion:', { title, text, category });
            
            // Show success message
            alert('Discussion started successfully!');
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('discussionModal'));
            if (modal) {
                modal.hide();
            }
        });
    }
}

/**
 * Initialize filter dropdowns
 */
function initializeFilters() {
    const filterSelects = document.querySelectorAll('.section-filters select');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            const section = select.closest('.section');
            const filterType = select.dataset.filter;
            
            // Apply filter based on type
            switch(filterType) {
                case 'sort':
                    sortReviews(select.value);
                    break;
                case 'rating':
                    filterByRating(select.value);
                    break;
                case 'skill':
                    filterBySkill(select.value);
                    break;
                case 'date':
                    filterByDate(select.value);
                    break;
            }
        });
    });
}

/**
 * Sort reviews based on selected criteria
 */
function sortReviews(criteria) {
    const reviewsContainer = document.querySelector('.reviews-container');
    const reviews = Array.from(reviewsContainer.children);
    
    reviews.sort((a, b) => {
        switch(criteria) {
            case 'newest':
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            case 'oldest':
                return new Date(a.dataset.date) - new Date(b.dataset.date);
            case 'highest':
                return parseInt(b.dataset.rating) - parseInt(a.dataset.rating);
            case 'lowest':
                return parseInt(a.dataset.rating) - parseInt(b.dataset.rating);
            default:
                return 0;
        }
    });
    
    // Reappend sorted reviews
    reviews.forEach(review => reviewsContainer.appendChild(review));
}

/**
 * Filter reviews by rating
 */
function filterByRating(rating) {
    const reviews = document.querySelectorAll('.review-card');
    
    reviews.forEach(review => {
        if (rating === 'all' || review.dataset.rating === rating) {
            review.style.display = 'flex';
        } else {
            review.style.display = 'none';
        }
    });
}

/**
 * Filter reviews by skill
 */
function filterBySkill(skill) {
    const reviews = document.querySelectorAll('.review-card');
    
    reviews.forEach(review => {
        if (skill === 'all' || review.dataset.skill === skill) {
            review.style.display = 'flex';
        } else {
            review.style.display = 'none';
        }
    });
}

/**
 * Filter reviews by date range
 */
function filterByDate(range) {
    const reviews = document.querySelectorAll('.review-card');
    const now = new Date();
    
    reviews.forEach(review => {
        const reviewDate = new Date(review.dataset.date);
        let show = false;
        
        switch(range) {
            case 'all':
                show = true;
                break;
            case 'week':
                show = (now - reviewDate) <= 7 * 24 * 60 * 60 * 1000;
                break;
            case 'month':
                show = (now - reviewDate) <= 30 * 24 * 60 * 60 * 1000;
                break;
            case 'year':
                show = (now - reviewDate) <= 365 * 24 * 60 * 60 * 1000;
                break;
        }
        
        review.style.display = show ? 'flex' : 'none';
    });
}

/**
 * Initialize Bootstrap accordions
 */
function initializeAccordions() {
    const accordions = document.querySelectorAll('.accordion-button');
    
    accordions.forEach(button => {
        button.addEventListener('click', () => {
            const isExpanded = button.classList.contains('collapsed');
            
            // Update icon rotation
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0)';
            }
            
            // Update discussion stats visibility
            const stats = button.closest('.accordion-item').querySelector('.discussion-stats');
            if (stats) {
                stats.style.display = isExpanded ? 'flex' : 'none';
            }
        });
    });
}

/**
 * Initialize feedback modal
 */
function initializeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    const form = modal.querySelector('form');
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateFeedbackForm(form)) {
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
            
            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Submit feedback (replace with actual API call)
            await submitFeedback(data);
            
            // Show success message
            showAlert('success', 'Thank you for your feedback!');
            
            // Reset form and close modal
            form.reset();
            bootstrap.Modal.getInstance(modal).hide();
            
        } catch (error) {
            showAlert('danger', 'Failed to submit feedback. Please try again.');
            console.error('Error submitting feedback:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Validate feedback form
 */
function validateFeedbackForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            // Add error message if not exists
            if (!field.nextElementSibling?.classList.contains('invalid-feedback')) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'This field is required';
                field.parentNode.insertBefore(feedback, field.nextSibling);
            }
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

/**
 * Submit feedback to server
 */
async function submitFeedback(data) {
    // Replace with actual API endpoint
    const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Failed to submit feedback');
    }
    
    return response.json();
}

/**
 * Show alert message
 */
function showAlert(type, message) {
    const alertContainer = document.querySelector('.alert-container');
    const alert = document.createElement('div');
    
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}

/**
 * Load reviews from server
 */
async function loadReviews() {
    try {
        // Replace with actual API endpoint
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        const container = document.querySelector('.reviews-container');
        container.innerHTML = reviews.map(review => createReviewCard(review)).join('');
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        showAlert('danger', 'Failed to load reviews. Please refresh the page.');
    }
}

/**
 * Create review card HTML
 */
function createReviewCard(review) {
    return `
        <div class="review-card" data-rating="${review.rating}" data-skill="${review.skill}" data-date="${review.date}">
            <div class="review-header">
                <div class="reviewer-info">
                    <img src="${review.avatar}" alt="${review.name}" class="reviewer-avatar">
                    <div class="reviewer-details">
                        <h5 class="reviewer-name">${review.name}</h5>
                        <span class="review-skill">${review.skill}</span>
                    </div>
                </div>
                <div class="review-rating">
                    <div class="stars">
                        ${Array(5).fill().map((_, i) => `
                            <i class="fas fa-star${i < review.rating ? ' active' : ''}"></i>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="review-content">
                <p>${review.content}</p>
            </div>
            <div class="review-footer">
                <span class="review-date">${formatDate(review.date)}</span>
                <div class="review-actions">
                    <button class="btn-helpful" data-helpful="${review.helpful}">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${review.helpful}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Load discussions from server
 */
async function loadDiscussions() {
    try {
        // Replace with actual API endpoint
        const response = await fetch('/api/discussions');
        const discussions = await response.json();
        
        const container = document.querySelector('.discussions-container');
        container.innerHTML = discussions.map(discussion => createDiscussionItem(discussion)).join('');
        
    } catch (error) {
        console.error('Error loading discussions:', error);
        showAlert('danger', 'Failed to load discussions. Please refresh the page.');
    }
}

/**
 * Create discussion item HTML
 */
function createDiscussionItem(discussion) {
    return `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#discussion${discussion.id}">
                    <div class="discussion-title">
                        ${discussion.title}
                        <span class="discussion-tag">${discussion.category}</span>
                    </div>
                    <div class="discussion-meta">
                        <span>Posted by ${discussion.author}</span>
                        <span>${formatDate(discussion.date)}</span>
                    </div>
                </button>
            </h2>
            <div id="discussion${discussion.id}" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <p>${discussion.content}</p>
                    <div class="discussion-stats">
                        <span><i class="fas fa-comment"></i> ${discussion.replies} replies</span>
                        <span><i class="fas fa-eye"></i> ${discussion.views} views</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
} 
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat functionality
    initializeChat();
});

// This function can be called by the page transitions system
function initializeChat() {
    // Elements
    const chatSidebar = document.getElementById('chatSidebar');
    const chatToggle = document.getElementById('chatToggle');
    const chatItems = document.querySelectorAll('.chat-item');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const emptyState = document.getElementById('emptyState');
    const chatMain = document.querySelector('.chat-main');
    
    // Toggle chat sidebar on mobile
    chatToggle.addEventListener('click', function() {
        chatSidebar.classList.toggle('show');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth < 992) {
            if (!chatSidebar.contains(event.target) && !chatToggle.contains(event.target)) {
                chatSidebar.classList.remove('show');
            }
        }
    });
    
    // Handle chat item selection
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            chatItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide empty state and show chat main
            emptyState.style.display = 'none';
            chatMain.style.display = 'flex';
            
            // Update chat header with selected user info
            const userName = this.querySelector('.chat-name').textContent;
            const userAvatar = this.querySelector('.chat-avatar').src;
            const isOnline = this.querySelector('.chat-status').classList.contains('online');
            
            document.querySelector('.chat-header-name').textContent = userName;
            document.querySelector('.chat-header-avatar').src = userAvatar;
            
            const statusDot = document.querySelector('.chat-header-status-dot');
            const statusText = document.querySelector('.chat-header-status span');
            
            if (isOnline) {
                statusDot.classList.add('online');
                statusDot.classList.remove('offline');
                statusText.textContent = 'Online';
            } else {
                statusDot.classList.add('offline');
                statusDot.classList.remove('online');
                statusText.textContent = 'Offline';
            }
            
            // Scroll to bottom of messages
            scrollToBottom();
            
            // Close sidebar on mobile after selection
            if (window.innerWidth < 992) {
                chatSidebar.classList.remove('show');
            }
        });
    });
    
    // Handle send message
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const messageText = messageInput.value.trim();
        
        if (messageText) {
            // Create message element
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent';
            
            // Get current time
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            
            // Set message content
            messageElement.innerHTML = `
                <div class="message-content">${messageText}</div>
                <div class="message-time">${timeString}</div>
            `;
            
            // Add message to chat
            chatMessages.appendChild(messageElement);
            
            // Clear input
            messageInput.value = '';
            
            // Scroll to bottom
            scrollToBottom();
            
            // Simulate received message after 1 second
            setTimeout(simulateReply, 1000);
        }
    }
    
    function simulateReply() {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message received';
        
        // Get current time
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        // Set message content
        messageElement.innerHTML = `
            <div class="message-content">Thanks for your message! I'll get back to you soon.</div>
            <div class="message-time">${timeString}</div>
        `;
        
        // Add message to chat
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Initial scroll to bottom
    scrollToBottom();
    
    // Handle emoji button (placeholder)
    document.getElementById('emojiButton').addEventListener('click', function() {
        alert('Emoji picker will be available in the next update!');
    });
    
    // Handle attachment button (placeholder)
    document.getElementById('attachmentButton').addEventListener('click', function() {
        alert('File attachment will be available in the next update!');
    });
    
    // Handle schedule button
    document.querySelector('.btn-schedule').addEventListener('click', function() {
        window.location.href = 'schedule.html';
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
            chatSidebar.classList.remove('show');
        }
    });
    
    // Add keyboard navigation for accessibility
    chatItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Add focus styles for keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
} 
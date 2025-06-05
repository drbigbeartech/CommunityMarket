// Global state management
class AppState {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'home';
        this.currentServiceType = 'hair-styling';
        this.currentProductType = 'food';
        this.currentDashboardTab = 'overview';
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentConversation = null;
        this.calendar = {
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear()
        };
        this.init();
    }

    init() {
        this.loadUserSession();
        this.setupEventListeners();
        this.initializeData();
        this.updateUI();
    }

    loadUserSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    saveUserSession() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    initializeData() {
        // Initialize sample data if not exists
        if (!localStorage.getItem('users')) {
            const sampleUsers = [
                {
                    id: '1',
                    email: 'maria@hairstudio.com',
                    password: 'password123',
                    fullName: 'Maria Rodriguez',
                    userType: 'seller',
                    businessName: "Maria's Hair Studio",
                    specialty: 'hair-styling',
                    rating: 4.9,
                    experience: '8 years',
                    services: ['knotless-braids', 'box-braids', 'boho-braids']
                },
                {
                    id: '2',
                    email: 'john@customer.com',
                    password: 'password123',
                    fullName: 'John Customer',
                    userType: 'customer'
                }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
        }

        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }

        if (!localStorage.getItem('messages')) {
            localStorage.setItem('messages', JSON.stringify([]));
        }

        if (!localStorage.getItem('services')) {
            localStorage.setItem('services', JSON.stringify([]));
        }

        if (!localStorage.getItem('bookings')) {
            localStorage.setItem('bookings', JSON.stringify([]));
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('dashboardBtn').addEventListener('click', () => this.navigateToSection('dashboard'));

        // Modal handling
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.hideModal(e.target.closest('.modal').id);
            });
        });

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('serviceForm').addEventListener('submit', (e) => this.handleServiceForm(e));

        // User type change in register form
        document.querySelector('[name="userType"]').addEventListener('change', (e) => {
            const sellerFields = document.querySelector('.seller-fields');
            if (e.target.value === 'seller') {
                sellerFields.classList.remove('hidden');
            } else {
                sellerFields.classList.add('hidden');
            }
        });

        // Service and product tabs
        document.querySelectorAll('.service-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchServiceTab(e.target.getAttribute('data-service')));
        });

        document.querySelectorAll('.product-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchProductTab(e.target.getAttribute('data-product')));
        });

        // Dashboard tabs
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchDashboardTab(e.target.getAttribute('data-tab')));
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                if (category === 'hair-styling' || category === 'barber') {
                    this.navigateToSection('services');
                    this.switchServiceTab(category);
                } else {
                    this.navigateToSection('products');
                    this.switchProductTab(category === 'food' ? 'food' : 'accessories');
                }
            });
        });

        // Service booking
        document.querySelectorAll('.book-service').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const service = e.target.getAttribute('data-service');
                this.showBookingModal(service);
            });
        });

        // Add service button
        document.getElementById('addServiceBtn').addEventListener('click', () => {
            this.showServiceModal();
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));

        // Messaging
        document.getElementById('sendMessageBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    navigateToSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

        // Show target section
        document.getElementById(section).classList.add('active');
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        this.currentSection = section;

        // Load section-specific data
        if (section === 'dashboard' && this.currentUser?.userType === 'seller') {
            this.loadDashboardData();
        }
    }

    switchServiceTab(serviceType) {
        document.querySelectorAll('.service-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.service-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-service="${serviceType}"]`).classList.add('active');
        document.getElementById(serviceType).classList.add('active');

        this.currentServiceType = serviceType;
    }

    switchProductTab(productType) {
        document.querySelectorAll('.product-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.product-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-product="${productType}"]`).classList.add('active');
        document.getElementById(productType).classList.add('active');

        this.currentProductType = productType;
    }

    switchDashboardTab(tab) {
        document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dashboard-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(tab).classList.add('active');

        this.currentDashboardTab = tab;

        // Load tab-specific data
        switch(tab) {
            case 'services':
                this.loadSellerServices();
                break;
            case 'orders':
                this.loadSellerOrders();
                break;
            case 'messages':
                this.loadConversations();
                break;
            case 'calendar':
                this.loadCalendar();
                break;
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            this.saveUserSession();
            this.updateUI();
            this.hideModal('loginModal');
            this.showNotification('Login successful!', 'success');
            
            if (user.userType === 'seller') {
                this.navigateToSection('dashboard');
            }
        } else {
            this.showNotification('Invalid credentials', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const userData = {
            id: Date.now().toString(),
            email: formData.get('email'),
            password: formData.get('password'),
            fullName: formData.get('fullName'),
            userType: formData.get('userType'),
            businessName: formData.get('businessName'),
            specialty: formData.get('specialty'),
            rating: 5.0,
            experience: '0 years',
            services: []
        };

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            this.showNotification('Email already registered', 'error');
            return;
        }

        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));

        this.currentUser = userData;
        this.saveUserSession();
        this.updateUI();
        this.hideModal('registerModal');
        this.showNotification('Registration successful!', 'success');

        if (userData.userType === 'seller') {
            this.navigateToSection('dashboard');
        }
    }

    logout() {
        this.currentUser = null;
        this.saveUserSession();
        this.updateUI();
        this.navigateToSection('home');
        this.showNotification('Logged out successfully', 'success');
    }

    updateUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.getElementById('userMenu');
        const userWelcome = document.getElementById('userWelcome');

        if (this.currentUser) {
            authButtons.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userWelcome.textContent = `Welcome, ${this.currentUser.fullName}`;
        } else {
            authButtons.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    showBookingModal(service) {
        if (!this.currentUser) {
            this.showNotification('Please login to book services', 'warning');
            this.showModal('loginModal');
            return;
        }

        const modal = document.getElementById('bookingModal');
        const content = document.getElementById('bookingContent');
        
        content.innerHTML = `
            <div class="booking-form">
                <h3>Book ${service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                <div class="form-group">
                    <label class="form-label">Select Date</label>
                    <div class="booking-calendar">
                        ${this.generateBookingCalendar()}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Select Time</label>
                    <div class="time-slots" id="timeSlots">
                        <span class="time-slot" data-time="09:00">9:00 AM</span>
                        <span class="time-slot" data-time="10:30">10:30 AM</span>
                        <span class="time-slot" data-time="12:00">12:00 PM</span>
                        <span class="time-slot" data-time="14:00">2:00 PM</span>
                        <span class="time-slot" data-time="16:00">4:00 PM</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Special Requests</label>
                    <textarea class="form-control" id="specialRequests" rows="3" placeholder="Any special requests or preferences..."></textarea>
                </div>
                <button class="btn btn--primary btn--full-width" onclick="appState.confirmBooking('${service}')">Confirm Booking</button>
            </div>
        `;

        // Add event listeners for date and time selection
        content.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', (e) => {
                if (!e.target.classList.contains('past')) {
                    content.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                    e.target.classList.add('selected');
                    this.selectedDate = e.target.getAttribute('data-date');
                }
            });
        });

        content.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                content.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedTime = e.target.getAttribute('data-time');
            });
        });

        this.showModal('bookingModal');
    }

    generateBookingCalendar() {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        let calendar = '<div class="calendar-header-days">';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            calendar += `<div class="calendar-day-header">${day}</div>`;
        });
        calendar += '</div><div class="calendar-grid">';

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            calendar += '<div class="calendar-day"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isPast = date < today;
            const isToday = date.toDateString() === today.toDateString();

            calendar += `<div class="calendar-day ${isPast ? 'past' : ''} ${isToday ? 'today' : ''}" data-date="${dateStr}">
                <div class="day-number">${day}</div>
            </div>`;
        }

        calendar += '</div>';
        return calendar;
    }

    confirmBooking(service) {
        if (!this.selectedDate || !this.selectedTime) {
            this.showNotification('Please select date and time', 'warning');
            return;
        }

        const specialRequests = document.getElementById('specialRequests').value;
        
        const booking = {
            id: Date.now().toString(),
            customerId: this.currentUser.id,
            customerName: this.currentUser.fullName,
            service: service,
            date: this.selectedDate,
            time: this.selectedTime,
            specialRequests: specialRequests,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        this.hideModal('bookingModal');
        this.showNotification('Booking confirmed! You will receive a confirmation message.', 'success');

        // Reset selection
        this.selectedDate = null;
        this.selectedTime = null;
    }

    showServiceModal(service = null) {
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const form = document.getElementById('serviceForm');

        if (service) {
            title.textContent = 'Edit Service';
            // Populate form with service data
        } else {
            title.textContent = 'Add New Service';
            form.reset();
        }

        this.showModal('serviceModal');
    }

    handleServiceForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const service = {
            id: Date.now().toString(),
            sellerId: this.currentUser.id,
            name: formData.get('serviceName'),
            description: formData.get('description'),
            price: formData.get('price'),
            duration: formData.get('duration'),
            category: formData.get('category'),
            createdAt: new Date().toISOString()
        };

        const services = JSON.parse(localStorage.getItem('services') || '[]');
        services.push(service);
        localStorage.setItem('services', JSON.stringify(services));

        this.hideModal('serviceModal');
        this.showNotification('Service added successfully!', 'success');
        this.loadSellerServices();
    }

    loadDashboardData() {
        if (this.currentDashboardTab === 'overview') {
            // Dashboard overview is static for demo
        }
    }

    loadSellerServices() {
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const userServices = services.filter(s => s.sellerId === this.currentUser.id);
        const servicesList = document.getElementById('servicesList');

        if (userServices.length === 0) {
            servicesList.innerHTML = '<p class="text-center">No services added yet. Click "Add New Service" to get started.</p>';
            return;
        }

        servicesList.innerHTML = userServices.map(service => `
            <div class="service-item">
                <div class="service-info">
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                    <div class="service-meta">
                        <span class="service-price">${service.price}</span>
                        <span class="service-duration">${service.duration}</span>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="btn btn--outline btn--sm" onclick="appState.editService('${service.id}')">Edit</button>
                    <button class="btn btn--secondary btn--sm" onclick="appState.deleteService('${service.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    loadSellerOrders() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const ordersList = document.getElementById('ordersList');

        if (bookings.length === 0) {
            ordersList.innerHTML = '<p class="text-center">No orders yet.</p>';
            return;
        }

        ordersList.innerHTML = bookings.map(booking => `
            <div class="order-item">
                <div class="order-header">
                    <h4>Order #${booking.id.slice(-6)}</h4>
                    <span class="status status--${booking.status === 'pending' ? 'warning' : booking.status === 'confirmed' ? 'info' : 'success'}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                </div>
                <div class="order-details">
                    <div>
                        <strong>Customer:</strong> ${booking.customerName}
                    </div>
                    <div>
                        <strong>Service:</strong> ${booking.service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div>
                        <strong>Date & Time:</strong> ${booking.date} at ${booking.time}
                    </div>
                </div>
                ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
                <div class="order-actions">
                    ${booking.status === 'pending' ? `<button class="btn btn--primary btn--sm" onclick="appState.updateOrderStatus('${booking.id}', 'confirmed')">Confirm</button>` : ''}
                    ${booking.status === 'confirmed' ? `<button class="btn btn--primary btn--sm" onclick="appState.updateOrderStatus('${booking.id}', 'completed')">Mark Complete</button>` : ''}
                    <button class="btn btn--outline btn--sm" onclick="appState.messageCustomer('${booking.customerId}')">Message Customer</button>
                </div>
            </div>
        `).join('');
    }

    updateOrderStatus(orderId, status) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.id === orderId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = status;
            localStorage.setItem('bookings', JSON.stringify(bookings));
            this.loadSellerOrders();
            this.showNotification(`Order ${status} successfully!`, 'success');
        }
    }

    loadConversations() {
        const conversations = [
            { id: '1', name: 'John Customer', lastMessage: 'Thank you for the service!', time: '2 hours ago' },
            { id: '2', name: 'Sarah Johnson', lastMessage: 'When are you available next week?', time: '1 day ago' }
        ];

        const conversationsList = document.getElementById('conversationsList');
        conversationsList.innerHTML = conversations.map(conv => `
            <div class="conversation-item" onclick="appState.openConversation('${conv.id}', '${conv.name}')">
                <div class="conversation-name">${conv.name}</div>
                <p class="conversation-preview">${conv.lastMessage}</p>
                <div class="conversation-time">${conv.time}</div>
            </div>
        `).join('');
    }

    openConversation(id, name) {
        this.currentConversation = id;
        document.getElementById('chatTitle').textContent = name;
        
        // Remove active class from all conversations
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current conversation
        event.target.closest('.conversation-item').classList.add('active');

        // Load messages for this conversation
        this.loadMessages(id);
    }

    loadMessages(conversationId) {
        const messages = [
            { id: '1', text: 'Hi! I would like to book an appointment for box braids.', sent: false, time: '10:30 AM' },
            { id: '2', text: 'Hello! I have availability this Friday at 2 PM. Would that work for you?', sent: true, time: '10:45 AM' },
            { id: '3', text: 'Perfect! How long does the service usually take?', sent: false, time: '11:00 AM' },
            { id: '4', text: 'Box braids typically take 5-6 hours depending on the length and size. I\'ll block out the whole afternoon for you.', sent: true, time: '11:15 AM' }
        ];

        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = messages.map(msg => `
            <div class="message ${msg.sent ? 'sent' : 'received'}">
                ${msg.text}
                <div class="message-time">${msg.time}</div>
            </div>
        `).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const text = messageInput.value.trim();
        
        if (!text || !this.currentConversation) return;

        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.innerHTML = `
            ${text}
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        messageInput.value = '';
        this.showNotification('Message sent!', 'success');
    }

    loadCalendar() {
        const currentMonth = document.getElementById('currentMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        currentMonth.textContent = `${months[this.calendar.currentMonth]} ${this.calendar.currentYear}`;
        
        const daysInMonth = new Date(this.calendar.currentYear, this.calendar.currentMonth + 1, 0).getDate();
        const firstDay = new Date(this.calendar.currentYear, this.calendar.currentMonth, 1).getDay();
        
        let calendarHTML = '';
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.calendar.currentYear, this.calendar.currentMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isAvailable = Math.random() > 0.3; // Random availability for demo
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${isAvailable ? 'available' : 'booked'}" onclick="appState.toggleAvailability(${day})">
                    <div class="day-number">${day}</div>
                    <div class="day-bookings">${isAvailable ? 'Available' : 'Booked'}</div>
                </div>
            `;
        }
        
        calendarGrid.innerHTML = calendarHTML;
    }

    changeMonth(direction) {
        this.calendar.currentMonth += direction;
        if (this.calendar.currentMonth > 11) {
            this.calendar.currentMonth = 0;
            this.calendar.currentYear++;
        } else if (this.calendar.currentMonth < 0) {
            this.calendar.currentMonth = 11;
            this.calendar.currentYear--;
        }
        this.loadCalendar();
    }

    toggleAvailability(day) {
        // Toggle availability for the selected day
        this.showNotification('Availability updated!', 'success');
        this.loadCalendar();
    }

    messageCustomer(customerId) {
        this.switchDashboardTab('messages');
        // Simulate opening conversation with customer
        this.showNotification('Opening conversation with customer', 'info');
    }

    editService(serviceId) {
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const service = services.find(s => s.id === serviceId);
        if (service) {
            this.showServiceModal(service);
        }
    }

    deleteService(serviceId) {
        if (confirm('Are you sure you want to delete this service?')) {
            const services = JSON.parse(localStorage.getItem('services') || '[]');
            const filteredServices = services.filter(s => s.id !== serviceId);
            localStorage.setItem('services', JSON.stringify(filteredServices));
            this.loadSellerServices();
            this.showNotification('Service deleted successfully!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize the application
const appState = new AppState();

// Add some additional event handlers for cart functionality
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!appState.currentUser) {
            appState.showNotification('Please login to add items to cart', 'warning');
            appState.showModal('loginModal');
            return;
        }
        
        appState.showNotification('Item added to cart!', 'success');
        
        // Here you would typically add the item to a cart in localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = {
            id: Date.now().toString(),
            name: e.target.closest('.card').querySelector('h3, h4').textContent,
            price: e.target.closest('.card').querySelector('.product-price').textContent,
            quantity: 1
        };
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
    });
});

// Handle modal clicks outside content
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            appState.hideModal(modal.id);
        }
    });
});

// Prevent form submission on Enter in search fields
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.type === 'search') {
        e.preventDefault();
        // Handle search functionality here if needed
    }
});

// Add some demo data for better user experience
window.addEventListener('load', () => {
    // Add some sample bookings for demo
    const sampleBookings = [
        {
            id: '1001',
            customerId: '2',
            customerName: 'John Customer',
            service: 'knotless-braids',
            date: '2025-06-15',
            time: '14:00',
            specialRequests: 'Medium length, brown color',
            status: 'pending',
            createdAt: '2025-06-01T10:00:00Z'
        },
        {
            id: '1002',
            customerId: '3',
            customerName: 'Sarah Wilson',
            service: 'box-braids',
            date: '2025-06-18',
            time: '09:00',
            specialRequests: '',
            status: 'confirmed',
            createdAt: '2025-06-01T12:00:00Z'
        }
    ];
    
    if (!localStorage.getItem('bookings') || JSON.parse(localStorage.getItem('bookings')).length === 0) {
        localStorage.setItem('bookings', JSON.stringify(sampleBookings));
    }
});
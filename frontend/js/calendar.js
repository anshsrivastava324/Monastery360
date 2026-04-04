// Global variables
let allEvents = [];
let filteredEvents = [];
const API_BASE_URL = 'http://localhost:5000';
let currentLanguage = 'en';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📅 Calendar page loaded');
    
    // Set default date range (today to 3 months from now)
    setDefaultDates();
    
    // Load upcoming events by default
    filterUpcoming();
    
    // Add event listeners
    setupEventListeners();
});

// Set default date range
function setDefaultDates() {
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    document.getElementById('startDate').value = today.toISOString().split('T')[0];
    document.getElementById('endDate').value = threeMonthsLater.toISOString().split('T')[0];
}

// Setup event listeners
function setupEventListeners() {
    // Language selector
    document.getElementById('language').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        displayEvents(filteredEvents); // Re-render with new language
    });
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchEvents();
        }
    });
}

// Search events with filters
async function searchEvents() {
    try {
        showLoading(true);
        
        const searchInput = document.getElementById('searchInput').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const eventType = document.getElementById('eventType').value;
        const monastery = document.getElementById('monastery').value;
        const region = document.getElementById('region').value;
        const touristAccess = document.getElementById('touristAccess').value;

        // Build query parameters
        const params = new URLSearchParams();
        
        if (searchInput) params.append('search', searchInput);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (eventType) params.append('eventType', eventType);
        if (monastery) params.append('monasteryName', monastery);
        if (region) params.append('region', region);
        if (touristAccess) params.append('touristAccess', touristAccess);

        console.log('🔍 Searching events with params:', params.toString());

        const response = await fetch(`${API_BASE_URL}/api/events?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
            allEvents = data.events || [];
            filteredEvents = [...allEvents];
            
            console.log(`✅ Found ${allEvents.length} events`);
            
            // Update title based on search
            if (searchInput) {
                document.getElementById('resultsTitle').textContent = 
                    `Search Results for "${searchInput}"`;
            } else if (monastery) {
                document.getElementById('resultsTitle').textContent = 
                    `Events at ${monastery}`;
            } else if (region) {
                document.getElementById('resultsTitle').textContent = 
                    `Events in ${region}`;
            } else {
                document.getElementById('resultsTitle').textContent = 'Events';
            }
            
            if (allEvents.length > 0) {
                displayEvents(filteredEvents);
            } else {
                showNoResults();
            }
        } else {
            showNoResults();
        }

    } catch (error) {
        console.error('❌ Error searching events:', error);
        alert('Error searching events. Please try again.');
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Filter upcoming events
async function filterUpcoming() {
    try {
        showLoading(true);
        
        console.log('🔜 Loading upcoming events...');

        const response = await fetch(`${API_BASE_URL}/api/events/filter/upcoming`);
        const data = await response.json();

        if (data.success) {
            allEvents = data.events || [];
            filteredEvents = [...allEvents];
            
            document.getElementById('resultsTitle').textContent = 'Upcoming Events';
            
            if (allEvents.length > 0) {
                displayEvents(filteredEvents);
            } else {
                showNoResults();
            }
        }

    } catch (error) {
        console.error('❌ Error loading upcoming events:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Filter featured events
async function filterFeatured() {
    try {
        showLoading(true);
        
        console.log('⭐ Loading featured events...');

        const response = await fetch(`${API_BASE_URL}/api/events/filter/featured`);
        const data = await response.json();

        if (data.success) {
            allEvents = data.events || [];
            filteredEvents = [...allEvents];
            
            document.getElementById('resultsTitle').textContent = 'Featured Events';
            
            if (allEvents.length > 0) {
                displayEvents(filteredEvents);
            } else {
                showNoResults();
            }
        }

    } catch (error) {
        console.error('❌ Error loading featured events:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Filter this month
function filterThisMonth() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('startDate').value = startOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = endOfMonth.toISOString().split('T')[0];
    
    searchEvents();
}

// Filter this week
function filterThisWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

    document.getElementById('startDate').value = startOfWeek.toISOString().split('T')[0];
    document.getElementById('endDate').value = endOfWeek.toISOString().split('T')[0];
    
    searchEvents();
}

// Display events
function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '';
        noResults.style.display = 'block';
        resultsCount.textContent = '';
        return;
    }

    noResults.style.display = 'none';
    resultsCount.textContent = `Found ${events.length} event${events.length !== 1 ? 's' : ''}`;

    eventsGrid.innerHTML = events.map(event => {
        const eventName = getTranslatedText(event.eventName, event.eventNameTranslations);
        const description = getTranslatedText(event.description, event.descriptionTranslations);
        
        return `
        <div class="event-card" onclick='openEventModal(${JSON.stringify(event).replace(/'/g, "&#39;")})'>
            ${event.featured ? '<div class="event-badge featured">⭐ FEATURED</div>' : ''}
            ${!event.featured && event.eventType ? `<div class="event-badge">${event.eventType}</div>` : ''}
            
            <img src="${event.images && event.images.length > 0 ? event.images[0].url : 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'}" 
                 alt="${eventName}" 
                 class="event-image"
                 onerror="this.src='https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'">
            
            <div class="event-content">
                <div class="event-date">
                    📅 ${formatDate(event.startDate)} ${event.startDate !== event.endDate ? '- ' + formatDate(event.endDate) : ''}
                </div>
                
                <h3 class="event-title">${eventName}</h3>
                
                <div class="event-monastery">
                    🏛️ ${event.monasteryName}
                </div>
                
                <p class="event-description">${description}</p>
                
                <div class="event-meta">
                    <span class="event-tag">${event.eventType || 'Event'}</span>
                    <span class="event-tag access-${event.touristAccess.toLowerCase()}">
                        ${event.touristAccess === 'Yes' ? '✅ Open to Tourists' : 
                          event.touristAccess === 'Restricted' ? '⚠️ Restricted' : 
                          '❌ Closed'}
                    </span>
                    ${event.bookingRequired === 'Yes' ? '<span class="event-tag">📝 Booking Required</span>' : ''}
                </div>
                
                <div class="event-footer">
                    <span class="event-location">📍 ${event.region || event.venueLocation}</span>
                    <button class="view-details-btn" onclick='event.stopPropagation(); openEventModal(${JSON.stringify(event).replace(/'/g, "&#39;")})'>
                        View Details →
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Get translated text based on current language
function getTranslatedText(defaultText, translations) {
    if (!translations || currentLanguage === 'en') {
        return defaultText;
    }
    
    const langMap = {
        'hi': translations.hindi,
        'ti': translations.tibetan,
        'ne': translations.nepali,
        'dz': translations.dzongkha
    };
    
    return langMap[currentLanguage] || defaultText;
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time for display
function formatTime(timeString) {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
}

// Open event details modal
function openEventModal(event) {
    const eventName = getTranslatedText(event.eventName, event.eventNameTranslations);
    const description = getTranslatedText(event.description, event.descriptionTranslations);
    
    const modalHTML = `
        <div id="eventModal" class="event-modal active">
            <div class="modal-content">
                <button class="modal-close" onclick="closeEventModal()">&times;</button>
                
                <img src="${event.images && event.images.length > 0 ? event.images[0].url : 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200'}" 
                     alt="${eventName}" 
                     class="modal-image">
                
                <div class="modal-body">
                    <h2 class="modal-title">${eventName}</h2>
                    
                    <div class="modal-meta">
                        <div class="meta-item">
                            <label>📅 Date</label>
                            <value>${formatDate(event.startDate)} ${event.startDate !== event.endDate ? '- ' + formatDate(event.endDate) : ''}</value>
                        </div>
                        
                        ${event.startTime ? `
                            <div class="meta-item">
                                <label>⏰ Time</label>
                                <value>${formatTime(event.startTime)} ${event.endTime ? '- ' + formatTime(event.endTime) : ''}</value>
                            </div>
                        ` : ''}
                        
                        <div class="meta-item">
                            <label>🏛️ Monastery</label>
                            <value>${event.monasteryName}</value>
                        </div>
                        
                        <div class="meta-item">
                            <label>📍 Location</label>
                            <value>${event.venueLocation}</value>
                        </div>
                        
                        <div class="meta-item">
                            <label>🎭 Type</label>
                            <value>${event.eventType}</value>
                        </div>
                        
                        <div class="meta-item">
                            <label>👥 Tourist Access</label>
                            <value>${event.touristAccess}</value>
                        </div>
                        
                        ${event.bookingRequired !== 'No' ? `
                            <div class="meta-item">
                                <label>📝 Booking</label>
                                <value>${event.bookingRequired === 'Yes' ? 'Required' : 'Recommended'}</value>
                            </div>
                        ` : ''}
                        
                        ${event.entryFee ? `
                            <div class="meta-item">
                                <label>💰 Entry Fee</label>
                                <value>${event.entryFee}</value>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-description">
                        <h3 style="color: #d4af37; margin-bottom: 15px; font-size: 20px;">About This Event</h3>
                        <p>${description}</p>
                        
                        ${event.culturalSignificance ? `
                            <h3 style="color: #d4af37; margin-top: 25px; margin-bottom: 15px; font-size: 20px;">Cultural Significance</h3>
                            <p>${event.culturalSignificance}</p>
                        ` : ''}
                        
                        ${event.dressCode ? `
                            <h3 style="color: #d4af37; margin-top: 25px; margin-bottom: 15px; font-size: 20px;">Dress Code</h3>
                            <p>${event.dressCode}</p>
                        ` : ''}
                        
                        ${event.guidelines && event.guidelines.length > 0 ? `
                            <h3 style="color: #d4af37; margin-top: 25px; margin-bottom: 15px; font-size: 20px;">Guidelines</h3>
                            <ul style="padding-left: 20px; color: rgba(232, 213, 183, 0.9);">
                                ${event.guidelines.map(g => `<li style="margin-bottom: 8px;">${g}</li>`).join('')}
                            </ul>
                        ` : ''}
                        
                        ${event.accessRestrictions ? `
                            <div style="background: rgba(241, 196, 15, 0.1); padding: 15px; border-radius: 10px; border-left: 3px solid #f1c40f; margin-top: 20px;">
                                <strong style="color: #f1c40f;">⚠️ Access Restrictions:</strong>
                                <p style="margin-top: 8px;">${event.accessRestrictions}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-actions">
                        ${event.coordinates ? `
                            <button class="action-btn" onclick="openGoogleMaps(${event.coordinates.latitude}, ${event.coordinates.longitude}, '${event.eventName.replace(/'/g, "\\'")}')">
                                🗺️ View on Google Maps
                            </button>
                        ` : ''}
                        
                        ${event.bookingUrl ? `
                            <button class="action-btn" onclick="window.open('${event.bookingUrl}', '_blank')">
                                📝 Book Now
                            </button>
                        ` : ''}
                        
                        ${event.contactEmail || event.contactPhone ? `
                            <button class="action-btn secondary" onclick="showContactInfo('${event.contactEmail || ''}', '${event.contactPhone || ''}')">
                                📞 Contact
                            </button>
                        ` : ''}
                        
                        <button class="action-btn secondary" onclick="shareEvent('${event.eventName.replace(/'/g, "\\'")}', '${event._id}')">
                            🔗 Share Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('eventModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close event modal
function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.remove();
    }
}

// Open Google Maps with event location
function openGoogleMaps(lat, lng, name) {
    // Google Maps URL with coordinates
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    
    console.log('📍 Opening Google Maps:', googleMapsUrl);
    console.log('Coordinates:', { lat, lng, name });
    
    window.open(googleMapsUrl, '_blank');
}

// Show contact information
function showContactInfo(email, phone) {
    let message = 'Contact Information:\n\n';
    if (email) message += `📧 Email: ${email}\n`;
    if (phone) message += `📞 Phone: ${phone}\n`;
    alert(message);
}

// Share event
function shareEvent(eventName, eventId) {
    const url = `${window.location.origin}/calendar?event=${eventId}`;
    
    if (navigator.share) {
        navigator.share({
            title: eventName,
            text: `Check out this event: ${eventName}`,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Event link copied to clipboard!');
        });
    }
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('eventType').value = '';
    document.getElementById('monastery').value = '';
    document.getElementById('region').value = '';
    document.getElementById('touristAccess').value = '';
    document.getElementById('language').value = 'en';
    currentLanguage = 'en';
    
    setDefaultDates();
    filterUpcoming();
}

// Show loading state
function showLoading(isLoading) {
    const eventsGrid = document.getElementById('eventsGrid');
    const noResults = document.getElementById('noResults');
    
    if (isLoading) {
        eventsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
                <div style="display: inline-block; width: 60px; height: 60px; border: 4px solid rgba(212, 175, 55, 0.2); border-radius: 50%; border-top-color: #d4af37; animation: spin 1s linear infinite;"></div>
                <p style="color: #d4af37; margin-top: 25px; font-size: 18px;">Loading events...</p>
            </div>
        `;
        noResults.style.display = 'none';
    }
}

// Show no results
function showNoResults() {
    const eventsGrid = document.getElementById('eventsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    eventsGrid.innerHTML = '';
    noResults.style.display = 'block';
    resultsCount.textContent = '';
}

// Make functions globally available
window.searchEvents = searchEvents;
window.filterUpcoming = filterUpcoming;
window.filterFeatured = filterFeatured;
window.filterThisMonth = filterThisMonth;
window.filterThisWeek = filterThisWeek;
window.resetFilters = resetFilters;
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.openGoogleMaps = openGoogleMaps;
window.showContactInfo = showContactInfo;
window.shareEvent = shareEvent;

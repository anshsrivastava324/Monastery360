// ========================================
// VIRTUAL TOUR PAGE - WITH SAMPLE DATA
// ========================================

// Sample monastery data with 360° panoramas
const SAMPLE_MONASTERIES = [
    {
        _id: '1',
        name: 'Rumtek Monastery',
        description: 'The largest monastery in Sikkim, Rumtek is the seat of the Karmapa and a major center of the Kagyu lineage of Tibetan Buddhism.',
        location: {
            region: 'East Sikkim',
            address: 'Rumtek, Gangtok, Sikkim'
        },
        altitude: 1550,
        images: ['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'],
        virtualTourUrl: 'https://pannellum.org/images/alma.jpg',
        foundedYear: 1966
    },
    {
        _id: '2',
        name: 'Tashiding Monastery',
        description: 'Located atop a conical hill, Tashiding is one of the most sacred monasteries in Sikkim, believed to fulfill wishes of devotees.',
        location: {
            region: 'West Sikkim',
            address: 'Tashiding, West Sikkim'
        },
        altitude: 1350,
        images: ['https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'],
        virtualTourUrl: 'https://pannellum.org/images/cerro-toco-0.jpg',
        foundedYear: 1641
    },
    {
        _id: '3',
        name: 'Pemayangtse Monastery',
        description: 'One of the oldest and most important monasteries in Sikkim, Pemayangtse belongs to the Nyingma order of Tibetan Buddhism.',
        location: {
            region: 'West Sikkim',
            address: 'Pelling, West Sikkim'
        },
        altitude: 2085,
        images: ['https://images.unsplash.com/photo-1586672806791-3a5a762e1e21?w=800'],
        virtualTourUrl: 'https://pannellum.org/images/bma-1.jpg',
        foundedYear: 1705
    },
    {
        _id: '4',
        name: 'Enchey Monastery',
        description: 'A 200-year-old monastery located in Gangtok, Enchey is known for its annual religious dance festival.',
        location: {
            region: 'East Sikkim',
            address: 'Gangtok, East Sikkim'
        },
        altitude: 1800,
        images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
        virtualTourUrl: 'https://pannellum.org/images/from-tree.jpg',
        foundedYear: 1840
    },
    {
        _id: '5',
        name: 'Dubdi Monastery',
        description: 'The oldest monastery in Sikkim, Dubdi was founded in 1701 and offers stunning views of the surrounding valleys.',
        location: {
            region: 'West Sikkim',
            address: 'Yuksom, West Sikkim'
        },
        altitude: 2100,
        images: ['https://images.unsplash.com/photo-1604608672516-f1b5230d1e0a?w=800'],
        virtualTourUrl: 'https://pannellum.org/images/alma.jpg',
        foundedYear: 1701
    },
    {
        _id: '6',
        name: 'Ralang Monastery',
        description: 'An important Kagyu monastery, Ralang is known for its beautiful architecture and peaceful atmosphere.',
        location: {
            region: 'South Sikkim',
            address: 'Ravangla, South Sikkim'
        },
        altitude: 1600,
        images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
        virtualTourUrl: 'https://pannellum.org/images/cerro-toco-0.jpg',
        foundedYear: 1768
    }
];

// Global variables
let allTours = [];
let filteredTours = [];
let currentFilter = 'all';
let viewer = null;
let currentTour = null;
let autoRotateEnabled = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎥 Virtual Tours page loaded');
    
    // Load tours
    loadAllTours();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchTours();
            }
        });
    }
    
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && viewer) {
            closeVirtualTour();
        }
    });
}

// Load all virtual tours
function loadAllTours() {
    try {
        showLoading(true);
        
        // Use sample data
        allTours = [...SAMPLE_MONASTERIES];
        filteredTours = [...allTours];
        
        console.log(`✅ Loaded ${allTours.length} virtual tours`);
        
        // Update stats
        const totalToursElement = document.getElementById('totalTours');
        if (totalToursElement) {
            totalToursElement.textContent = allTours.length;
        }
        
        displayTours(filteredTours);
        
    } catch (error) {
        console.error('❌ Error loading virtual tours:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Search tours
function searchTours() {
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    if (!searchQuery) {
        filteredTours = allTours.filter(tour => {
            if (currentFilter === 'all') return true;
            return tour.location.region.toLowerCase().includes(currentFilter);
        });
        document.getElementById('sectionTitle').textContent = 'Available Virtual Tours';
    } else {
        filteredTours = allTours.filter(tour => {
            const matchesSearch = tour.name.toLowerCase().includes(searchQuery) ||
                                (tour.description && tour.description.toLowerCase().includes(searchQuery)) ||
                                (tour.location.region && tour.location.region.toLowerCase().includes(searchQuery));
            
            if (currentFilter === 'all') return matchesSearch;
            return matchesSearch && tour.location.region.toLowerCase().includes(currentFilter);
        });
        document.getElementById('sectionTitle').textContent = `Search Results for "${searchQuery}"`;
    }
    
    if (filteredTours.length > 0) {
        displayTours(filteredTours);
    } else {
        showNoResults();
    }
}

// Filter by region
function filterByRegion(region) {
    currentFilter = region;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (region === 'all') {
        filteredTours = [...allTours];
        document.getElementById('sectionTitle').textContent = 'Available Virtual Tours';
    } else {
        filteredTours = allTours.filter(tour => 
            tour.location.region.toLowerCase().includes(region)
        );
        document.getElementById('sectionTitle').textContent = `${region.charAt(0).toUpperCase() + region.slice(1)} Sikkim Virtual Tours`;
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    if (filteredTours.length > 0) {
        displayTours(filteredTours);
    } else {
        showNoResults();
    }
}

// Display tours
function displayTours(tours) {
    const toursGrid = document.getElementById('toursGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!toursGrid) return;
    
    if (!tours || tours.length === 0) {
        toursGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        if (resultsCount) resultsCount.textContent = '';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    if (resultsCount) {
        resultsCount.textContent = `Showing ${tours.length} virtual tour${tours.length !== 1 ? 's' : ''}`;
    }
    
    toursGrid.innerHTML = tours.map(tour => `
        <div class="tour-card">
            <div class="tour-card-image-container">
                <img src="${tour.images && tour.images[0] ? tour.images[0] : 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'}" 
                     alt="${tour.name}" 
                     class="tour-card-image"
                     onerror="this.src='https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'">
                <span class="tour-badge">360° VR</span>
            </div>
            
            <div class="tour-card-content">
                <h3 class="tour-card-title">${tour.name}</h3>
                
                <div class="tour-card-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${tour.location.region}</span>
                    ${tour.altitude ? `<span>• ${tour.altitude}m</span>` : ''}
                </div>
                
                <p class="tour-card-description">${tour.description || 'Explore this sacred monastery in immersive 360° virtual reality.'}</p>
                
                <div class="tour-card-actions">
                    <button class="tour-btn primary" onclick='startVirtualTour(${JSON.stringify(tour).replace(/'/g, "&#39;")})'>
                        <i class="fas fa-vr-cardboard"></i>
                        <span>Start Virtual Tour</span>
                    </button>
                    
                    <div class="tour-secondary-actions">
                        <button class="tour-btn" onclick='getDirections("${tour.name}")' title="Get Directions">
                            <i class="fas fa-directions"></i>
                            <span>Directions</span>
                        </button>
                        
                        <button class="tour-btn" onclick='readAbout("${tour._id}")' title="Read About">
                            <i class="fas fa-book-open"></i>
                            <span>Read About</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}




// ========================================
// VIRTUAL TOUR FUNCTIONS
// ========================================

// Start Virtual Tour
function startVirtualTour(tour) {
    openVirtualTour(tour);
}

// Open Virtual Tour Modal
function openVirtualTour(tour) {
    currentTour = tour;
    console.log('🎥 Opening virtual tour for:', tour.name);
    
    const modal = document.getElementById('vtourModal');
    const title = document.getElementById('vtourTitle');
    const location = document.getElementById('vtourLocation');
    const description = document.getElementById('vtourDescription');
    
    if (modal) modal.classList.add('active');
    if (title) title.textContent = tour.name;
    if (location) {
        location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${tour.location.region}`;
    }
    if (description) {
        description.textContent = tour.description || 'Experience this sacred monastery in immersive 360°';
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Initialize Pannellum viewer
    initializePannellum(tour);
}

// Initialize Pannellum
function initializePannellum(tour) {
    // Destroy existing viewer if any
    if (viewer) {
        viewer.destroy();
        viewer = null;
    }
    
    const panoramaContainer = document.getElementById('panorama');
    if (!panoramaContainer) {
        console.error('Panorama container not found');
        return;
    }
    
    // Get panorama URL
    const panoramaUrl = tour.virtualTourUrl || tour.virtual360Url;
    
    if (!panoramaUrl) {
        console.error('No virtual tour URL found');
        panoramaContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(26, 26, 46, 0.9);">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 70px; color: #d4af37; margin-bottom: 25px; opacity: 0.7;"></i>
                    <h3 style="color: #d4af37; margin-bottom: 15px; font-size: 24px;">Virtual Tour Not Available</h3>
                    <p style="color: rgba(232, 213, 183, 0.7); font-size: 16px;">360° panorama for this monastery will be added soon.</p>
                </div>
            </div>
        `;
        return;
    }
    
    console.log('Loading panorama:', panoramaUrl);
    
    try {
        // Initialize Pannellum viewer
        viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": panoramaUrl,
            "autoLoad": true,
            "autoRotate": -2,
            "autoRotateInactivityDelay": 3000,
            "autoRotateStopDelay": 5000,
            "showControls": true,
            "showFullscreenCtrl": true,
            "showZoomCtrl": true,
            "mouseZoom": true,
            "compass": true,
            "hfov": 100,
            "pitch": 0,
            "yaw": 0,
            "minHfov": 50,
            "maxHfov": 120,
            "hotSpotDebug": false,
            "strings": {
                "loadingLabel": "Loading virtual tour...",
                "bylineLabel": `${tour.name} - 360° Virtual Tour`
            }
        });
        
        autoRotateEnabled = true;
        
        // Event listeners
        viewer.on('load', () => {
            console.log('✅ Panorama loaded successfully');
        });
        
        viewer.on('error', (err) => {
            console.error('❌ Pannellum error:', err);
            panoramaContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(26, 26, 46, 0.9);">
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 70px; color: #e74c3c; margin-bottom: 25px;"></i>
                        <h3 style="color: #e74c3c; margin-bottom: 15px; font-size: 24px;">Failed to Load Tour</h3>
                        <p style="color: rgba(232, 213, 183, 0.7); font-size: 16px;">Unable to load the 360° panorama. Please try again.</p>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error('Failed to initialize Pannellum:', error);
        alert('Failed to load virtual tour. Please try again.');
    }
}

// Close Virtual Tour
function closeVirtualTour() {
    const modal = document.getElementById('vtourModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Destroy viewer
    if (viewer) {
        viewer.destroy();
        viewer = null;
    }
    
    currentTour = null;
    autoRotateEnabled = false;
}

// Reset View
function resetView() {
    if (viewer) {
        viewer.setPitch(0);
        viewer.setYaw(0);
        viewer.setHfov(100);
        console.log('🔄 View reset');
    }
}

// Toggle Fullscreen
function toggleFullscreen() {
    if (viewer) {
        viewer.toggleFullscreen();
        console.log('📺 Fullscreen toggled');
    }
}

// Toggle Auto Rotate
function toggleAutoRotate() {
    if (viewer) {
        autoRotateEnabled = !autoRotateEnabled;
        
        if (autoRotateEnabled) {
            viewer.setAutoRotate(-2);
            console.log('🔄 Auto-rotate enabled');
        } else {
            viewer.setAutoRotate(false);
            console.log('⏸️ Auto-rotate disabled');
        }
    }
}

// Share Tour
function shareVTour() {
    if (!currentTour) return;
    
    const url = `${window.location.origin}/vtour.html?tour=${currentTour._id}`;
    const title = `${currentTour.name} - Virtual Tour`;
    const text = `Experience ${currentTour.name} in 360° Virtual Reality`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('✅ Virtual tour link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            prompt('Copy this link:', url);
        });
    }
}

// View Monastery Details
function viewMonastery(monasteryId) {
    window.location.href = `/archives.html?id=${monasteryId}`;
}

// Get Directions
function getDirections(monasteryName) {
    const query = encodeURIComponent(monasteryName + ', Sikkim');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
}

// Read About
function readAbout(monasteryId) {
    window.location.href = `/archives.html?id=${monasteryId}`;
}

// Show loading
function showLoading(isLoading) {
    const toursGrid = document.getElementById('toursGrid');
    const noResults = document.getElementById('noResults');
    
    if (!toursGrid) return;
    
    if (isLoading) {
        toursGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 100px 20px;">
                <div style="display: inline-block; width: 70px; height: 70px; border: 5px solid rgba(212, 175, 55, 0.2); border-radius: 50%; border-top-color: #d4af37; animation: spin 1s linear infinite;"></div>
                <p style="color: #d4af37; margin-top: 30px; font-size: 18px; font-weight: 600;">Loading virtual tours...</p>
            </div>
        `;
        if (noResults) noResults.style.display = 'none';
    }
}

// Show no results
function showNoResults() {
    const toursGrid = document.getElementById('toursGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (toursGrid) toursGrid.innerHTML = '';
    if (noResults) noResults.style.display = 'block';
    if (resultsCount) resultsCount.textContent = '';
}

// Make functions globally available
window.searchTours = searchTours;
window.filterByRegion = filterByRegion;
window.startVirtualTour = startVirtualTour;
window.openVirtualTour = openVirtualTour;
window.closeVirtualTour = closeVirtualTour;
window.resetView = resetView;
window.toggleFullscreen = toggleFullscreen;
window.toggleAutoRotate = toggleAutoRotate;
window.shareVTour = shareVTour;
window.viewMonastery = viewMonastery;
window.getDirections = getDirections;
window.readAbout = readAbout;

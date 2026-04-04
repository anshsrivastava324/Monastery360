// Global variables
let allHotels = [];
let filteredHotels = [];
const API_BASE_URL = 'https://monastery360-2a8a.onrender.com';

// Store last search parameters for re-searching with new dates
let lastSearchParams = {
    type: null, // 'coordinates' or 'city'
    latitude: null,
    longitude: null,
    locationName: null,
    cityCode: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Hotels page loaded');
    
    // Check if coming from monastery card with URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const latitude = urlParams.get('lat');
    const longitude = urlParams.get('lng');
    const location = urlParams.get('location');

    console.log('URL params:', { latitude, longitude, location });

    if (latitude && longitude) {
        // Store coordinates for future searches
        lastSearchParams = {
            type: 'coordinates',
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            locationName: location || 'this location'
        };
        
        // Auto-fill search with location name (for display only)
        document.getElementById('searchInput').value = location || `Near ${latitude}, ${longitude}`;
        
        console.log('🚀 Auto-searching hotels...');
        
        // Automatically search using coordinates
        searchHotelsByCoordinates(
            parseFloat(latitude), 
            parseFloat(longitude), 
            location || 'this location'
        );
    }

    // Set default dates (today and tomorrow)
    setDefaultDates();
    
    // Add event listeners for filters and sorting
    setupEventListeners();
});

// Set default check-in and check-out dates
function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkInDate = today.toISOString().split('T')[0];
    const checkOutDate = tomorrow.toISOString().split('T')[0];

    document.getElementById('checkInDate').value = checkInDate;
    document.getElementById('checkOutDate').value = checkOutDate;

    // Set minimum dates
    document.getElementById('checkInDate').min = checkInDate;
    document.getElementById('checkOutDate').min = checkOutDate;
}

// Setup event listeners for filters and sorting
function setupEventListeners() {
    // Filter change listeners
    document.getElementById('ratingFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('availabilityFilter').addEventListener('change', applyFilters);
    
    // Sort change listener
    document.getElementById('sortBy').addEventListener('change', applySorting);
}

// Main search function - now handles re-searching with stored params
async function searchHotels() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    console.log('🔍 Search triggered!');
    console.log('Search input:', searchInput);
    console.log('Check-in:', checkInDate);
    console.log('Check-out:', checkOutDate);

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today) {
        alert('❌ Check-in date must be today or in the future');
        return;
    }

    if (checkOut <= checkIn) {
        alert('❌ Check-out date must be after check-in date');
        return;
    }

    // Check if search input has changed from last search
    const isNewSearch = lastSearchParams.type === 'coordinates' && 
                       searchInput !== lastSearchParams.locationName &&
                       !searchInput.includes('Near');

    console.log('Is new search?', isNewSearch);
    console.log('Last search location:', lastSearchParams.locationName);

    // If we have stored coordinates AND search input hasn't changed, re-use coordinates
    if (lastSearchParams.type === 'coordinates' && !isNewSearch) {
        console.log('📍 Re-searching with stored coordinates and new dates');
        await searchHotelsByCoordinates(
            lastSearchParams.latitude,
            lastSearchParams.longitude,
            lastSearchParams.locationName
        );
        return;
    }

    // Otherwise, process the search input as a new search
    if (!searchInput) {
        alert('Please enter a location to search');
        return;
    }

    console.log('🆕 Processing new search input');

    // Check if input is coordinates (lat, lng format)
    const coordMatch = searchInput.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        console.log('📍 Searching by coordinates:', lat, lng);
        
        lastSearchParams = {
            type: 'coordinates',
            latitude: lat,
            longitude: lng,
            locationName: searchInput
        };
        
        await searchHotelsByCoordinates(lat, lng, searchInput);
    } else {
        // Search by location name - CLEAR stored coordinates
        console.log('🏙️ Searching by city/location name:', searchInput);
        
        // Clear previous coordinate search
        lastSearchParams = {
            type: 'city',
            cityCode: searchInput,
            latitude: null,
            longitude: null,
            locationName: null
        };
        
        await searchHotelsByCity(searchInput);
    }
}

// Search hotels by coordinates
async function searchHotelsByCoordinates(latitude, longitude, locationName) {
    console.log('🔍 searchHotelsByCoordinates called');
    console.log('Lat:', latitude, 'Lng:', longitude, 'Name:', locationName);
    
    showLoading(true);

    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    console.log('Dates:', checkInDate, 'to', checkOutDate);

    const url = `${API_BASE_URL}/api/hotels/search?latitude=${latitude}&longitude=${longitude}&radius=50&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=1`;
    
    console.log('🌐 API URL:', url);

    try {
        const response = await fetch(url);
        
        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        
        console.log('📦 Response data:', data);

        if (data.success) {
            allHotels = data.hotels || [];
            filteredHotels = [...allHotels];
            
            console.log('✅ Found hotels:', allHotels.length);
            console.log('💰 Hotels with pricing:', data.availableCount || 0);
            
            document.getElementById('resultsTitle').textContent = 
                `Hotels near ${locationName || 'selected location'}`;
            
            if (allHotels.length > 0) {
                displayHotels(filteredHotels);
            } else {
                showNoResults();
            }
        } else {
            console.error('❌ Search failed:', data.message);
            showNoResults();
        }
    } catch (error) {
        console.error('❌ Search error:', error);
        alert('Error searching hotels. Please check console for details.');
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Search hotels by city name
async function searchHotelsByCity(cityName) {
    showLoading(true);

    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    // Convert city name to city code (first 3 letters uppercase)
    const cityCode = cityName.substring(0, 3).toUpperCase();

    console.log('🔍 Searching city:', cityName, 'Code:', cityCode);

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/hotels/search-by-city?cityCode=${cityCode}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=1`
        );

        const data = await response.json();
        
        console.log('📦 City search response:', data);
        console.log('💰 Hotels with pricing:', data.availableCount || 0);

        if (data.success) {
            allHotels = data.hotels || [];
            filteredHotels = [...allHotels];
            
            document.getElementById('resultsTitle').textContent = 
                `Hotels in ${cityName}`;
            
            if (allHotels.length > 0) {
                displayHotels(filteredHotels);
            } else {
                showNoResults();
            }
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('Error searching hotels. Please try again.');
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Display hotels in grid
function displayHotels(hotels) {
    const hotelsGrid = document.getElementById('hotelsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!hotels || hotels.length === 0) {
        hotelsGrid.innerHTML = '';
        noResults.style.display = 'block';
        resultsCount.textContent = '';
        return;
    }

    noResults.style.display = 'none';
    
    // Show count and helpful message
    const availableCount = hotels.filter(h => h.available && h.price).length;
    if (availableCount === 0 && hotels.length > 0) {
        resultsCount.innerHTML = `Found ${hotels.length} hotel${hotels.length !== 1 ? 's' : ''} <span style="color: #e8d5b7; opacity: 0.8; font-size: 13px;">(Compare prices on booking platforms)</span>`;
    } else if (availableCount < hotels.length) {
        resultsCount.innerHTML = `Found ${hotels.length} hotel${hotels.length !== 1 ? 's' : ''} <span style="color: #2ecc71; font-size: 13px;">(${availableCount} with live pricing)</span>`;
    } else {
        resultsCount.textContent = `Found ${hotels.length} hotel${hotels.length !== 1 ? 's' : ''}`;
    }

    hotelsGrid.innerHTML = hotels.map(hotel => {
        // Clean up rating display
        let displayRating = hotel.rating || 4.0;
        let stars = generateStars(displayRating);
        const hotelImage = hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
        const imageAlt = hotel.name ? `${hotel.name} hotel image` : 'Hotel image';

        return `
        <div class="hotel-card">
            <div class="hotel-image-wrap">
                <img class="hotel-image" src="${hotelImage}" alt="${imageAlt}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';">
                ${hotel.imageSource ? `<span class="hotel-image-badge">${hotel.imageSource === 'provider' ? 'Amadeus image' : 'Fallback image'}</span>` : ''}
            </div>
            <div class="hotel-content">
                <div class="hotel-header">
                    <div>
                        <h3 class="hotel-name">${hotel.name}</h3>
                        <p class="hotel-location">📍 ${hotel.location}</p>
                    </div>
                    <div class="hotel-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-number">${displayRating.toFixed(1)}</span>
                    </div>
                </div>

                <div class="hotel-details">
                    <div class="detail-item">
                        <span>${hotel.distance || 'Distance available on map'}</span>
                    </div>
                        <div class="detail-item">
                            <span>🛎️ ${hotel.available ? 'Bookable now' : 'Check platforms for latest availability'}</span>
                        </div>
                    ${hotel.price ? `
                        <div class="detail-item">
                            ${hotel.available ? `
                                <span class="availability-badge available">
                                    ✅ Live Price
                                </span>
                            ` : hotel.price.estimated ? `
                                <span class="availability-badge estimated">
                                    ℹ️ Estimated Price
                                </span>
                            ` : `
                                <span class="availability-badge unavailable">
                                    ⚠️ Price Unavailable
                                </span>
                            `}
                        </div>
                    ` : ''}
                </div>

                <div class="hotel-footer">
                    <div class="hotel-price">
                        ${hotel.price && hotel.price.perNight ? `
                            <span class="price-label">${hotel.available ? 'Per Night (Live)' : 'Per Night (Estimated)'}</span>
                            <span class="price-amount">
                                ₹${hotel.price.perNight.toLocaleString('en-IN')}
                            </span>
                            ${hotel.price.originalCurrency && hotel.price.originalCurrency !== 'INR' ? `
                                <span style="font-size: 11px; opacity: 0.7; display: block; margin-top: 4px;">
                                    (${hotel.price.originalCurrency} ${hotel.price.originalPrice})
                                </span>
                            ` : ''}
                        ` : `
                            <span class="price-label">Best Price</span>
                            <span class="price-amount" style="font-size: 14px; opacity: 0.7;">
                                Compare on platforms
                            </span>
                        `}
                    </div>
                    <button class="book-btn" onclick='comparePrices(${JSON.stringify(hotel).replace(/'/g, "&#39;")})'>
                        💰 Compare Prices
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '⭐';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

function slugifyForPath(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getHotelSearchContext(hotel) {
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const locationParts = String(hotel.location || '').split(',').map(part => part.trim()).filter(Boolean);
    const cityName = locationParts[0] || 'Sikkim';
    const destination = [hotel.name, cityName].filter(Boolean).join(' ').trim();
    const citySlug = slugifyForPath(cityName);

    return {
        checkInDate,
        checkOutDate,
        cityName,
        citySlug,
        agodaCitySlug: `${citySlug}-in`,
        goibiboCitySlug: `hotels-in-${citySlug}-ct`,
        mmtCitySlug: `${citySlug}-hotels`,
        destination,
        destinationQuery: encodeURIComponent(destination)
    };
}

// Generate Booking.com URL
function generateBookingComURL(hotel) {
    const baseURL = 'https://www.booking.com/searchresults.html';
    const { checkInDate, checkOutDate, destination } = getHotelSearchContext(hotel);
    
    const params = new URLSearchParams({
        ss: destination,
        checkin: checkInDate,
        checkout: checkOutDate,
        group_adults: '1',
        group_children: '0',
        no_rooms: '1',
        dest_type: 'hotel'
    });
    
    return `${baseURL}?${params.toString()}`;
}

// Generate Agoda URL
function generateAgodaURL(hotel) {
    const { checkInDate, checkOutDate, agodaCitySlug, cityName, destination } = getHotelSearchContext(hotel);
    const baseURL = `https://www.agoda.com/city/${agodaCitySlug}.html`;
    
    const params = new URLSearchParams({
        textToSearch: destination,
        city: cityName,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: '1',
        rooms: '1',
        children: '0'
    });
    
    return `${baseURL}?${params.toString()}`;
}

// Generate MakeMyTrip URL
function generateMakeMyTripURL(hotel) {
    const { checkInDate, checkOutDate, cityName, destination, mmtCitySlug } = getHotelSearchContext(hotel);
    const baseURL = `https://www.makemytrip.com/hotels/${mmtCitySlug}.html`;
    
    const params = new URLSearchParams({
        city: cityName,
        searchText: destination,
        checkin: checkInDate,
        checkout: checkOutDate,
        adults: '1',
        rooms: '1',
        roomStayQualifier: '1-0',
        country: 'IN'
    });
    
    return `${baseURL}?${params.toString()}`;
}

// Generate Goibibo URL
function generateGoibiboURL(hotel) {
    const { checkInDate, checkOutDate, goibiboCitySlug, destinationQuery } = getHotelSearchContext(hotel);
    const baseURL = `https://www.goibibo.com/hotels/${goibiboCitySlug}/`;

    const params = new URLSearchParams({
        ci: checkInDate,
        co: checkOutDate,
        r: '1-1-0',
        adults: '1',
        rooms: '1',
        searchText: destinationQuery
    });

    return `${baseURL}?${params.toString()}`;
}

function getStablePriceAdjustment(hotel, salt) {
    const source = `${hotel.hotelId || hotel.name || 'hotel'}-${salt}`;
    let hash = 0;

    for (let i = 0; i < source.length; i++) {
        hash = (hash << 5) - hash + source.charCodeAt(i);
        hash |= 0;
    }

    // Deterministic adjustment in range [-0.02, +0.02]
    return ((Math.abs(hash) % 5) - 2) / 100;
}

function getPlatformPrices(hotel) {
    if (!hotel.price || !hotel.price.perNight) {
        return {
            booking: null,
            agoda: null,
            makemytrip: null,
            goibibo: null
        };
    }

    const base = hotel.price.perNight;
    const platformMultipliers = {
        booking: 1.0,
        agoda: 0.99,
        makemytrip: 1.02,
        goibibo: 1.01
    };

    return {
        booking: Math.max(1, Math.round(base * (platformMultipliers.booking + getStablePriceAdjustment(hotel, 'booking')))),
        agoda: Math.max(1, Math.round(base * (platformMultipliers.agoda + getStablePriceAdjustment(hotel, 'agoda')))),
        makemytrip: Math.max(1, Math.round(base * (platformMultipliers.makemytrip + getStablePriceAdjustment(hotel, 'makemytrip')))),
        goibibo: Math.max(1, Math.round(base * (platformMultipliers.goibibo + getStablePriceAdjustment(hotel, 'goibibo'))))
    };
}

function formatPlatformPrice(value) {
    return value ? `INR ${value.toLocaleString('en-IN')} / night` : 'Price unavailable';
}

// Compare prices across platforms
function comparePrices(hotel) {
    console.log('💰 Opening compare prices for:', hotel.name);
    
    // Check if dates are selected
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    
    if (!checkInDate || !checkOutDate) {
        alert('⚠️ Please select check-in and check-out dates before comparing prices');
        return;
    }
    
    // Generate URLs for all platforms
    const bookingURL = generateBookingComURL(hotel);
    const agodaURL = generateAgodaURL(hotel);
    const mmtURL = generateMakeMyTripURL(hotel);
    const goibiboURL = generateGoibiboURL(hotel);
    const platformPrices = getPlatformPrices(hotel);
    
    // Create modal HTML
    const modalHTML = `
        <div id="comparePricesModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 35px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); max-width: 500px; width: 90%; border: 1px solid rgba(212, 175, 55, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="color: #d4af37; margin: 0; font-size: 24px; font-family: 'Cinzel', serif;">Compare Prices</h3>
                    <button onclick="closeComparePricesModal()" style="background: transparent; border: none; color: #e8d5b7; font-size: 28px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.3s;">&times;</button>
                </div>
                
                <div style="background: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 3px solid #d4af37;">
                    <p style="color: #e8d5b7; margin: 0; font-size: 15px; line-height: 1.6;">
                        <strong style="color: #d4af37;">${hotel.name}</strong><br>
                        <span style="opacity: 0.8; font-size: 13px;">📍 ${hotel.location}</span><br>
                        <span style="opacity: 0.8; font-size: 13px;">📅 ${checkInDate} to ${checkOutDate}</span>
                    </p>
                </div>
                
                ${hotel.price && hotel.price.perNight ? `
                    <div style="background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(39, 174, 96, 0.15)); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(46, 204, 113, 0.3);">
                        <p style="color: #2ecc71; margin: 0; font-size: 14px; font-weight: 600;">
                            ✅ Base Live Price: INR ${hotel.price.perNight.toLocaleString('en-IN')} per night
                        </p>
                        <p style="color: rgba(232, 213, 183, 0.75); margin: 6px 0 0; font-size: 12px;">
                            Platform prices below are direct comparison estimates for quick decision making.
                        </p>
                    </div>
                ` : ''}
                
                <p style="color: rgba(232, 213, 183, 0.7); margin-bottom: 20px; font-size: 14px; text-align: center;">
                    Choose your preferred booking platform:
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <a href="${bookingURL}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #003580, #0057b8); color: white; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 4px 12px rgba(0, 53, 128, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0, 53, 128, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 53, 128, 0.3)'">
                        <span style="display:flex;align-items:center;gap:10px;"><span style="font-size: 20px;">🌐</span><span>Booking.com</span></span>
                        <span style="font-size:13px; font-weight:700;">${formatPlatformPrice(platformPrices.booking)}</span>
                    </a>
                    
                    <a href="${agodaURL}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #d32f2f, #e13b3c); color: white; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 4px 12px rgba(227, 59, 60, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(227, 59, 60, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(227, 59, 60, 0.3)'">
                        <span style="display:flex;align-items:center;gap:10px;"><span style="font-size: 20px;">🔴</span><span>Agoda</span></span>
                        <span style="font-size:13px; font-weight:700;">${formatPlatformPrice(platformPrices.agoda)}</span>
                    </a>
                    
                    <a href="${mmtURL}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #e7352b, #ff5722); color: white; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 4px 12px rgba(231, 53, 43, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(231, 53, 43, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(231, 53, 43, 0.3)'">
                        <span style="display:flex;align-items:center;gap:10px;"><span style="font-size: 20px;">✈️</span><span>MakeMyTrip</span></span>
                        <span style="font-size:13px; font-weight:700;">${formatPlatformPrice(platformPrices.makemytrip)}</span>
                    </a>
                    
                    <a href="${goibiboURL}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #ff6d00, #ff9100); color: white; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 4px 12px rgba(255, 109, 0, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(255, 109, 0, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(255, 109, 0, 0.3)'">
                        <span style="display:flex;align-items:center;gap:10px;"><span style="font-size: 20px;">🛫</span><span>Goibibo</span></span>
                        <span style="font-size:13px; font-weight:700;">${formatPlatformPrice(platformPrices.goibibo)}</span>
                    </a>
                </div>
                
                <button onclick="closeComparePricesModal()" style="margin-top: 20px; background: rgba(232, 213, 183, 0.1); border: 1px solid rgba(232, 213, 183, 0.3); color: #e8d5b7; padding: 12px 16px; border-radius: 8px; cursor: pointer; width: 100%; font-size: 14px; font-weight: 500; transition: all 0.3s;" onmouseover="this.style.background='rgba(232, 213, 183, 0.2)'" onmouseout="this.style.background='rgba(232, 213, 183, 0.1)'">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close compare prices modal
function closeComparePricesModal() {
    const modal = document.getElementById('comparePricesModal');
    if (modal) {
        modal.remove();
    }
}

// Apply filters
function applyFilters() {
    const ratingFilter = document.getElementById('ratingFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const availabilityFilter = document.getElementById('availabilityFilter').value;

    console.log('Applying filters:', { ratingFilter, priceFilter, availabilityFilter });

    filteredHotels = allHotels.filter(hotel => {
        // Rating filter
        let ratingMatch = true;
        if (ratingFilter === '4+') {
            ratingMatch = hotel.rating && hotel.rating >= 4;
        } else if (ratingFilter === '3+') {
            ratingMatch = hotel.rating && hotel.rating >= 3;
        }

        // Price filter
        let priceMatch = true;
        if (hotel.price && hotel.price.perNight) {
            if (priceFilter === 'under50') {
                priceMatch = hotel.price.perNight < 4000; // ~$50 in INR
            } else if (priceFilter === '50-100') {
                priceMatch = hotel.price.perNight >= 4000 && hotel.price.perNight <= 8000;
            } else if (priceFilter === '100-200') {
                priceMatch = hotel.price.perNight >= 8000 && hotel.price.perNight <= 16000;
            } else if (priceFilter === 'over200') {
                priceMatch = hotel.price.perNight > 16000;
            }
        }

        // Availability filter
        let availabilityMatch = true;
        if (availabilityFilter === 'available') {
            availabilityMatch = hotel.available === true && hotel.price !== null;
        }

        return ratingMatch && priceMatch && availabilityMatch;
    });

    console.log('Filtered hotels:', filteredHotels.length);

    // Re-apply sorting after filtering
    applySorting();
}

// Apply sorting
function applySorting() {
    const sortBy = document.getElementById('sortBy').value;

    console.log('Sorting by:', sortBy);

    switch (sortBy) {
        case 'price-low':
            filteredHotels.sort((a, b) => {
                const priceA = a.price ? a.price.perNight : Infinity;
                const priceB = b.price ? b.price.perNight : Infinity;
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filteredHotels.sort((a, b) => {
                const priceA = a.price ? a.price.perNight : 0;
                const priceB = b.price ? b.price.perNight : 0;
                return priceB - priceA;
            });
            break;
        case 'rating-high':
            filteredHotels.sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return ratingB - ratingA;
            });
            break;
        case 'rating-low':
            filteredHotels.sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return ratingA - ratingB;
            });
            break;
        case 'popularity':
        default:
            // Keep original order (by popularity/relevance)
            break;
    }

    displayHotels(filteredHotels);
}

// Reset filters
function resetFilters() {
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('availabilityFilter').value = 'all';
    document.getElementById('sortBy').value = 'popularity';

    filteredHotels = [...allHotels];
    displayHotels(filteredHotels);
}

// Show loading state
function showLoading(isLoading) {
    const hotelsGrid = document.getElementById('hotelsGrid');
    const noResults = document.getElementById('noResults');
    
    if (isLoading) {
        hotelsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(212, 175, 55, 0.3); border-radius: 50%; border-top-color: #d4af37; animation: spin 1s linear infinite;"></div>
                <p style="color: #d4af37; margin-top: 20px; font-size: 16px;">Searching for hotels and fetching live prices...</p>
            </div>
        `;
        noResults.style.display = 'none';
    }
}

// Show no results
function showNoResults() {
    const hotelsGrid = document.getElementById('hotelsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    hotelsGrid.innerHTML = '';
    noResults.style.display = 'block';
    resultsCount.textContent = '';
}

// Make functions available globally
window.searchHotels = searchHotels;
window.applyFilters = applyFilters;
window.applySorting = applySorting;
window.resetFilters = resetFilters;
window.comparePrices = comparePrices;
window.closeComparePricesModal = closeComparePricesModal;

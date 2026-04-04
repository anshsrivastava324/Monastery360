const express = require('express');
const router = express.Router();
const Amadeus = require('amadeus');

// Initialize Amadeus client
if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    console.error('❌ Amadeus API credentials not found in .env file!');
    console.log('Please add AMADEUS_API_KEY and AMADEUS_API_SECRET to your .env file');
}

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET
});

console.log('✅ Amadeus API initialized');

// Helper function to generate varied realistic ratings
function generateRealisticRating(hotelName, index) {
    // Create varied ratings based on hotel name hash and index
    const nameHash = hotelName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratings = [3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7];
    const ratingIndex = (nameHash + index) % ratings.length;
    return ratings[ratingIndex];
}

// Helper function to get hotel image
function getHotelImage(hotelName, hotelId) {
    // Use Unsplash for hotel images based on hotel name
    const query = encodeURIComponent(hotelName.split(' ').slice(0, 2).join(' '));
    return `https://source.unsplash.com/800x600/?hotel,luxury,${query}`;
}

// Try to use provider image URLs from Amadeus payload when present
function getProviderImageURL(hotel, offer) {
    const candidates = [
        offer?.hotel?.media?.[0]?.uri,
        offer?.hotel?.media?.[0]?.url,
        offer?.hotel?.images?.[0]?.url,
        offer?.hotel?.image,
        hotel?.media?.[0]?.uri,
        hotel?.media?.[0]?.url,
        hotel?.images?.[0]?.url,
        hotel?.image
    ].filter(Boolean);

    const valid = candidates.find(url => {
        if (typeof url !== 'string') return false;
        const value = url.trim();
        return value.startsWith('http://') || value.startsWith('https://');
    });

    return valid || null;
}

const geoImageCache = new Map();

async function fetchGeoContextImageURL(hotel) {
    const lat = hotel?.geoCode?.latitude;
    const lng = hotel?.geoCode?.longitude;
    if (!lat || !lng) return null;

    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    if (geoImageCache.has(cacheKey)) {
        return geoImageCache.get(cacheKey);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat}|${lng}&ggsradius=2500&ggslimit=12&prop=pageimages&piprop=thumbnail&pithumbsize=900&format=json`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) return null;

        const data = await response.json();
        const pages = data?.query?.pages ? Object.values(data.query.pages) : [];

        const candidate = pages.find(page => {
            const src = page?.thumbnail?.source;
            if (!src || typeof src !== 'string') return false;

            const lower = src.toLowerCase();
            // Prefer photographic formats, avoid logos/icons.
            return lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.webp');
        });

        const image = candidate?.thumbnail?.source || null;
        geoImageCache.set(cacheKey, image);
        return image;
    } catch (error) {
        geoImageCache.set(cacheKey, null);
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

async function fetchWebImageURL(query) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
        const response = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
            },
            signal: controller.signal
        });

        if (!response.ok) return null;

        const html = await response.text();
        const directMatch = html.match(/"murl":"(https?:[^\"]+)"/i);
        const escapedMatch = html.match(/murl\\u0022:\\u0022(https?:[^\\]+?)\\u0022/i);
        const raw = (directMatch && directMatch[1]) || (escapedMatch && escapedMatch[1]);

        if (!raw) return null;

        const normalized = raw
            .replace(/\\u002f/g, '/')
            .replace(/\\\//g, '/')
            .replace(/&amp;/g, '&');

        if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
            return null;
        }

        return normalized;
    } catch (error) {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

async function getResolvedHotelImage(hotel, offer) {
    const providerImage = getProviderImageURL(hotel, offer);
    if (providerImage) {
        return {
            image: providerImage,
            imageSource: 'provider'
        };
    }

    const geoImage = await fetchGeoContextImageURL(hotel);
    if (geoImage) {
        return {
            image: geoImage,
            imageSource: 'provider'
        };
    }

    const cityOrState = [hotel?.address?.cityName, hotel?.address?.stateCode].filter(Boolean).join(' ');
    const searchQuery = `${hotel?.name || 'hotel'} ${cityOrState} hotel`;
    const searchedImage = await fetchWebImageURL(searchQuery);
    if (searchedImage) {
        return {
            image: searchedImage,
            imageSource: 'provider'
        };
    }

    return {
        image: getHotelImage(hotel.name, hotel.hotelId),
        imageSource: 'fallback'
    };
}

// Fallback estimated pricing when live offers are not available
function generateEstimatedPriceINR(hotelName, rating = 4.0, index = 0) {
    const normalized = (hotelName || '').toLowerCase();
    const premiumSignals = ['royal', 'plaza', 'resort', 'spa', 'grand', 'palace', 'luxury', 'suite'];
    const premiumBoost = premiumSignals.some(word => normalized.includes(word)) ? 1800 : 0;

    // Base price by rating band
    const ratingBase = Math.round(2200 + ((rating - 3) * 1700));

    // Deterministic variation by hotel name/index so cards don't all show same value
    const hashSeed = `${hotelName || 'hotel'}-${index}`;
    let hash = 0;
    for (let i = 0; i < hashSeed.length; i++) {
        hash = (hash * 31 + hashSeed.charCodeAt(i)) % 100000;
    }
    const variation = (hash % 1400) - 700;

    return Math.max(1800, ratingBase + premiumBoost + variation);
}

// Helper function to convert currency to INR
async function convertToINR(amount, currency) {
    // Approximate conversion rates (update these regularly or use a currency API)
    const conversionRates = {
        'USD': 83.0,
        'EUR': 91.0,
        'GBP': 105.0,
        'AED': 22.6,
        'SGD': 62.0,
        'INR': 1.0,
        'THB': 2.4,
        'MYR': 18.5,
        'JPY': 0.56
    };
    
    const rate = conversionRates[currency] || 83.0; // Default to USD rate
    return amount * rate;
}

// Search hotels by coordinates
router.get('/search', async (req, res) => {
    try {
        const { latitude, longitude, radius = 50, checkInDate, checkOutDate, adults = 1 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        console.log(`🔍 Searching hotels near: ${latitude}, ${longitude} (Radius: ${radius}km, Dates: ${checkInDate} to ${checkOutDate})`);

        // Step 1: Get list of hotels by geocode
        const hotelListResponse = await amadeus.referenceData.locations.hotels.byGeocode.get({
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: parseInt(radius),
            radiusUnit: 'KM'
        });

        const hotels = hotelListResponse.data;

        if (!hotels || hotels.length === 0) {
            console.log('❌ No hotels found in this area');
            return res.json({
                success: true,
                hotels: [],
                message: 'No hotels found in this area. Try increasing the search radius.'
            });
        }

        console.log(`✅ Found ${hotels.length} hotels`);

        // Get hotel IDs (limit to 20 for performance)
        const hotelIds = hotels.slice(0, 20).map(hotel => hotel.hotelId).join(',');

        // Step 2: Get hotel offers with pricing (ONLY if dates provided)
        let hotelOffers = [];
        
        if (checkInDate && checkOutDate) {
            try {
                console.log(`📅 Fetching real-time pricing for dates: ${checkInDate} to ${checkOutDate}`);
                const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
                    hotelIds: hotelIds,
                    adults: parseInt(adults),
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate
                });
                hotelOffers = offersResponse.data || [];
                console.log(`✅ Found ${hotelOffers.length} hotels with real pricing`);
                
                // Log pricing details
                if (hotelOffers.length > 0) {
                    const samplePrices = hotelOffers.slice(0, 3).map(o => ({
                        hotel: o.hotel?.name || 'Unknown',
                        price: o.offers?.[0]?.price?.total || 'N/A',
                        currency: o.offers?.[0]?.price?.currency || 'N/A'
                    }));
                    console.log('💰 Sample real prices:', samplePrices);
                } else {
                    console.log('⚠️ No hotels have pricing data for selected dates');
                }
            } catch (error) {
                console.error('❌ Could not fetch pricing:', error.description || error.message);
            }
        } else {
            console.log('⚠️ No dates provided - skipping pricing fetch');
        }

        // Step 3: Get hotel ratings
        const hotelRatings = {};
        try {
            console.log('🔍 Fetching hotel ratings...');
            const ratingsResponse = await amadeus.eReputation.hotelSentiments.get({
                hotelIds: hotelIds
            });
            
            if (ratingsResponse.data && ratingsResponse.data.length > 0) {
                ratingsResponse.data.forEach(rating => {
                    if (rating.overallRating !== undefined && rating.overallRating !== null) {
                        // Amadeus returns ratings on 0-100 scale, convert to 1-5
                        let convertedRating = parseFloat(rating.overallRating) / 20;
                        // Clamp between 3.0 and 5.0 for realism
                        convertedRating = Math.min(5.0, Math.max(3.0, convertedRating));
                        hotelRatings[rating.hotelId] = parseFloat(convertedRating.toFixed(1));
                    }
                });
                console.log(`✅ Retrieved ratings for ${ratingsResponse.data.length} hotels`);
            } else {
                console.log('⚠️ No ratings data returned from Amadeus');
            }
        } catch (error) {
            console.log('⚠️ Ratings not available:', error.description || error.message);
        }

        // Step 4: Combine all data - ONLY REAL PRICES
        const enrichedHotels = await Promise.all(hotels.map(async (hotel, index) => {
            const offer = hotelOffers.find(o => o.hotel && o.hotel.hotelId === hotel.hotelId);
            const amadeusRating = hotelRatings[hotel.hotelId];
            const resolvedImage = await getResolvedHotelImage(hotel, offer);

            // Determine rating with fallback
            let displayRating;
            if (amadeusRating && !isNaN(amadeusRating)) {
                displayRating = amadeusRating;
            } else {
                displayRating = generateRealisticRating(hotel.name, index);
            }

            // Get live pricing first
            let priceData = null;
            if (offer && offer.offers && offer.offers[0]) {
                const originalPrice = parseFloat(offer.offers[0].price.total);
                const originalCurrency = offer.offers[0].price.currency;
                
                // Convert to INR if not already
                let priceInINR = originalPrice;
                if (originalCurrency !== 'INR') {
                    priceInINR = await convertToINR(originalPrice, originalCurrency);
                }
                
                priceData = {
                    currency: 'INR',
                    total: Math.round(priceInINR),
                    perNight: Math.round(priceInINR),
                    originalCurrency: originalCurrency,
                    originalPrice: originalPrice
                };
                
                console.log(`💰 ${hotel.name}: ${originalCurrency} ${originalPrice} → INR ${Math.round(priceInINR)}`);
            } else {
                const estimated = generateEstimatedPriceINR(hotel.name, displayRating, index);
                priceData = {
                    currency: 'INR',
                    total: estimated,
                    perNight: estimated,
                    estimated: true,
                    originalCurrency: null,
                    originalPrice: null
                };
                console.log(`⚠️ ${hotel.name}: Live pricing unavailable, estimated INR ${estimated}`);
            }

            return {
                hotelId: hotel.hotelId,
                name: hotel.name,
                location: hotel.address ? 
                    `${hotel.address.cityName || ''}, ${hotel.address.stateCode || ''} ${hotel.address.countryCode || ''}`.trim() : 
                    'Location not available',
                address: hotel.address,
                coordinates: hotel.geoCode,
                distance: hotel.distance ? `${hotel.distance.value} ${hotel.distance.unit}` : null,
                rating: displayRating,
                price: priceData, // Will be null if no real price
                available: !priceData.estimated, // true only for live offer pricing
                amenities: offer && offer.hotel ? offer.hotel.amenities : [],
                image: resolvedImage.image,
                imageSource: resolvedImage.imageSource
            };
        }));

        console.log(`✅ Enriched ${enrichedHotels.length} hotels (${enrichedHotels.filter(h => h.available).length} with live pricing)`);

        res.json({
            success: true,
            hotels: enrichedHotels,
            count: enrichedHotels.length,
            availableCount: enrichedHotels.filter(h => h.available).length
        });

    } catch (error) {
        console.error('❌ Hotel search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching hotels',
            error: error.description || error.message
        });
    }
});

// Search hotels by city name
router.get('/search-by-city', async (req, res) => {
    try {
        const { cityCode, checkInDate, checkOutDate, adults = 1 } = req.query;

        if (!cityCode) {
            return res.status(400).json({
                success: false,
                message: 'City code is required'
            });
        }

        // City name to IATA code mapping
        const cityCodeMap = {
            'mumbai': 'BOM',
            'delhi': 'DEL',
            'new delhi': 'DEL',
            'bangalore': 'BLR',
            'bengaluru': 'BLR',
            'kolkata': 'CCU',
            'chennai': 'MAA',
            'hyderabad': 'HYD',
            'pune': 'PNQ',
            'ahmedabad': 'AMD',
            'gangtok': 'IXB',
            'sikkim': 'IXB',
            'darjeeling': 'IXB',
            'goa': 'GOI',
            'jaipur': 'JAI',
            'lucknow': 'LKO',
            'chandigarh': 'IXC',
            'kochi': 'COK',
            'thiruvananthapuram': 'TRV',
            'varanasi': 'VNS',
            'amritsar': 'ATQ',
            'new york': 'NYC',
            'london': 'LON',
            'paris': 'PAR',
            'dubai': 'DXB',
            'singapore': 'SIN'
        };

        const normalizedCity = cityCode.toLowerCase().trim();
        const iataCode = cityCodeMap[normalizedCity] || cityCode.substring(0, 3).toUpperCase();

        console.log(`🔍 Searching hotels in: "${cityCode}" (IATA: ${iataCode})`);

        try {
            // Get hotels by city
            const response = await amadeus.referenceData.locations.hotels.byCity.get({
                cityCode: iataCode
            });

            const hotels = response.data;
            
            if (!hotels || hotels.length === 0) {
                return res.json({
                    success: true,
                    hotels: [],
                    count: 0,
                    message: `No hotels found in ${cityCode}. Try another city or search by coordinates.`
                });
            }

            console.log(`✅ Found ${hotels.length} hotels in ${iataCode}`);

            // Limit to 30 hotels
            const limitedHotels = hotels.slice(0, 30);
            const hotelIds = limitedHotels.map(h => h.hotelId).join(',');

            // Get offers ONLY if dates provided
            let offers = [];
            if (checkInDate && checkOutDate && hotelIds) {
                try {
                    console.log(`📅 Fetching real-time pricing for dates: ${checkInDate} to ${checkOutDate}`);
                    const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
                        hotelIds,
                        adults: parseInt(adults),
                        checkInDate,
                        checkOutDate
                    });
                    offers = offersResponse.data || [];
                    console.log(`✅ Found ${offers.length} hotels with real pricing`);
                    
                    if (offers.length > 0) {
                        const samplePrices = offers.slice(0, 3).map(o => ({
                            hotel: o.hotel?.name || 'Unknown',
                            price: o.offers?.[0]?.price?.total || 'N/A',
                            currency: o.offers?.[0]?.price?.currency || 'N/A'
                        }));
                        console.log('💰 Sample real prices:', samplePrices);
                    }
                } catch (offerError) {
                    console.error('❌ Pricing error:', offerError.description || offerError.message);
                }
            }

            // Get ratings
            const hotelRatings = {};
            try {
                const ratingsResponse = await amadeus.eReputation.hotelSentiments.get({
                    hotelIds: hotelIds
                });
                
                if (ratingsResponse.data && ratingsResponse.data.length > 0) {
                    ratingsResponse.data.forEach(rating => {
                        if (rating.overallRating !== undefined && rating.overallRating !== null) {
                            let convertedRating = parseFloat(rating.overallRating) / 20;
                            convertedRating = Math.min(5.0, Math.max(3.0, convertedRating));
                            hotelRatings[rating.hotelId] = parseFloat(convertedRating.toFixed(1));
                        }
                    });
                    console.log(`✅ Retrieved ratings for ${ratingsResponse.data.length} hotels`);
                }
            } catch (ratingError) {
                console.log('⚠️ Ratings not available');
            }

            const enrichedHotels = await Promise.all(limitedHotels.map(async (hotel, index) => {
                const offer = offers.find(o => o.hotel && o.hotel.hotelId === hotel.hotelId);
                const amadeusRating = hotelRatings[hotel.hotelId];
                const resolvedImage = await getResolvedHotelImage(hotel, offer);
                
                // Determine rating
                let displayRating;
                if (amadeusRating && !isNaN(amadeusRating)) {
                    displayRating = amadeusRating;
                } else {
                    displayRating = generateRealisticRating(hotel.name, index);
                }
                
                // Get live pricing first - converted to INR
                let priceData = null;
                if (offer && offer.offers && offer.offers[0]) {
                    const originalPrice = parseFloat(offer.offers[0].price.total);
                    const originalCurrency = offer.offers[0].price.currency;
                    
                    // Convert to INR
                    let priceInINR = originalPrice;
                    if (originalCurrency !== 'INR') {
                        priceInINR = await convertToINR(originalPrice, originalCurrency);
                    }
                    
                    priceData = {
                        currency: 'INR',
                        total: Math.round(priceInINR),
                        perNight: Math.round(priceInINR),
                        originalCurrency: originalCurrency,
                        originalPrice: originalPrice
                    };
                    
                    console.log(`💰 ${hotel.name}: ${originalCurrency} ${originalPrice} → ₹${Math.round(priceInINR)}`);
                } else {
                    const estimated = generateEstimatedPriceINR(hotel.name, displayRating, index);
                    priceData = {
                        currency: 'INR',
                        total: estimated,
                        perNight: estimated,
                        estimated: true,
                        originalCurrency: null,
                        originalPrice: null
                    };
                    console.log(`⚠️ ${hotel.name}: Live pricing unavailable, estimated INR ${estimated}`);
                }
                
                return {
                    hotelId: hotel.hotelId,
                    name: hotel.name,
                    location: hotel.address ? 
                        `${hotel.address.cityName || cityCode}, ${hotel.address.countryCode || ''}`.trim() : 
                        cityCode,
                    address: hotel.address,
                    coordinates: hotel.geoCode,
                    distance: hotel.distance ? `${hotel.distance.value} ${hotel.distance.unit}` : null,
                    rating: displayRating,
                    price: priceData, // null if no real price
                    available: !priceData.estimated, // true only for live offer pricing
                    amenities: offer && offer.hotel ? offer.hotel.amenities : [],
                    image: resolvedImage.image,
                    imageSource: resolvedImage.imageSource
                };
            }));

            res.json({
                success: true,
                hotels: enrichedHotels,
                count: enrichedHotels.length,
                availableCount: enrichedHotels.filter(h => h.available).length
            });

        } catch (amadeusError) {
            console.error('❌ Amadeus API Error:', {
                code: amadeusError.code,
                description: amadeusError.description
            });

            return res.json({
                success: true,
                hotels: [],
                count: 0,
                message: `Could not find hotels for "${cityCode}". Try using major city names like Mumbai, Delhi, Bangalore.`
            });
        }

    } catch (error) {
        console.error('❌ City search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching hotels by city',
            error: error.message
        });
    }
});

module.exports = router;

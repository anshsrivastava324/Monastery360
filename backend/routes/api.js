// routes/api.js
const express = require('express');
const router = express.Router();
const Monastery = require('../models/Monastery');
const Attraction = require('../models/Attraction');
const mongoose = require('mongoose');

// GET all monasteries and attractions
router.get('/monasteries', async (req, res) => {
    try {
        const { 
            search,
            district, 
            tradition, 
            minAltitude, 
            maxAltitude,
            minYear,
            maxYear,
            active = 'true'  // Default to showing active only
        } = req.query;

        // Build query
        let monasteryQuery = {};
        let attractionQuery = {};

        // Only show active items by default
        if (active === 'true') {
            monasteryQuery.isActive = true;
            attractionQuery.isActive = true;
        }

        // Text search
        if (search) {
            monasteryQuery.$text = { $search: search };
        }

        // Filter by district
        if (district) {
            monasteryQuery.district = district;
        }

        // Filter by tradition
        if (tradition) {
            monasteryQuery.tradition = tradition;
        }

        // Validate and filter by altitude range
        if (minAltitude || maxAltitude) {
            monasteryQuery.altitude = {};
            if (minAltitude) {
                const minVal = parseInt(minAltitude);
                if (!isNaN(minVal)) monasteryQuery.altitude.$gte = minVal;
            }
            if (maxAltitude) {
                const maxVal = parseInt(maxAltitude);
                if (!isNaN(maxVal)) monasteryQuery.altitude.$lte = maxVal;
            }
        }

        // Validate and filter by established year
        if (minYear || maxYear) {
            monasteryQuery.established = {};
            if (minYear) {
                const minVal = parseInt(minYear);
                if (!isNaN(minVal)) monasteryQuery.established.$gte = minVal;
            }
            if (maxYear) {
                const maxVal = parseInt(maxYear);
                if (!isNaN(maxVal)) monasteryQuery.established.$lte = maxVal;
            }
        }

        const monasteries = await Monastery.find(monasteryQuery).sort({ name: 1 });
        const attractions = await Attraction.find(attractionQuery).sort({ name: 1 });

        res.json({
            success: true,
            count: monasteries.length,
            monasteries,
            attractions,
            attractionCount: attractions.length
        });
    } catch (error) {
        console.error('Error fetching monasteries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching data',
            error: error.message
        });
    }
});

// GET a single monastery by ID
router.get('/monasteries/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid monastery ID format'
            });
        }

        const monastery = await Monastery.findById(req.params.id);

        if (!monastery) {
            return res.status(404).json({
                success: false,
                message: 'Monastery not found'
            });
        }

        res.json({
            success: true,
            monastery
        });
    } catch (error) {
        console.error('Error fetching monastery:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monastery',
            error: error.message
        });
    }
});

module.exports = router;
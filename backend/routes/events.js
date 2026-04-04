const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Monastery = require('../models/Monastery');
const mongoose = require('mongoose');

// Get all events with filtering
router.get('/', async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            monasteryId,
            monasteryName,
            eventType,
            region,
            touristAccess,
            search,
            featured,
            status,
            page = 1,
            limit = 50
        } = req.query;

        // Build query
        let query = {};

        // Date range filter
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        // Monastery filter
        if (monasteryId) query.monasteryId = monasteryId;
        if (monasteryName) query.monasteryName = monasteryName; // Exact match for dropdown

        // Event type filter
        if (eventType) query.eventType = eventType;

        // Region filter
        if (region) query.region = region;

        // Tourist access filter
        if (touristAccess) query.touristAccess = touristAccess;

        // Featured filter
        if (featured) query.featured = featured === 'true';

        // Status filter
        if (status) query.status = status;
        else query.status = { $ne: 'Cancelled' }; // Exclude cancelled by default

        // Search filter - search in event name AND monastery name
        if (search) {
            query.$or = [
                { eventName: new RegExp(search, 'i') },
                { monasteryName: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { tags: new RegExp(search, 'i') }
            ];
        }

        console.log('📅 Events query:', JSON.stringify(query, null, 2));

        // Execute query with pagination
        const events = await Event.find(query)
            .sort({ startDate: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Event.countDocuments(query);

        res.json({
            success: true,
            events,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalEvents: count
        });

    } catch (error) {
        console.error('❌ Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
});

// IMPORTANT: Specific filter routes must come BEFORE generic /:id route

// Get upcoming events
router.get('/filter/upcoming', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const events = await Event.find({
            startDate: { $gte: today },
            status: 'Upcoming'
        })
        .sort({ startDate: 1 })
        .limit(20);

        res.json({
            success: true,
            events,
            count: events.length
        });

    } catch (error) {
        console.error('❌ Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming events',
            error: error.message
        });
    }
});

// Get featured events
router.get('/filter/featured', async (req, res) => {
    try {
        const events = await Event.find({
            featured: true,
            status: { $ne: 'Cancelled' }
        })
        .sort({ startDate: 1 })
        .limit(10);

        res.json({
            success: true,
            events,
            count: events.length
        });

    } catch (error) {
        console.error('❌ Error fetching featured events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured events',
            error: error.message
        });
    }
});

// Get events by monastery
router.get('/monastery/:monasteryId', async (req, res) => {
    try {
        const events = await Event.find({
            monasteryId: req.params.monasteryId,
            status: { $ne: 'Cancelled' }
        }).sort({ startDate: 1 });

        res.json({
            success: true,
            events,
            count: events.length
        });

    } catch (error) {
        console.error('❌ Error fetching monastery events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monastery events',
            error: error.message
        });
    }
});

// Get single event by ID
router.get('/:id', async (req, res) => {
    try {
        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID format'
            });
        }

        const event = await Event.findById(req.params.id).populate('monasteryId');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });

    } catch (error) {
        console.error('❌ Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
});

// Create new event (Admin only - add auth middleware later)
router.post('/', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        });

    } catch (error) {
        console.error('❌ Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
});

// Update event (Admin only)
router.put('/:id', async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID format'
            });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully',
            event
        });

    } catch (error) {
        console.error('❌ Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
});

// Delete event (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID format'
            });
        }

        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
});

module.exports = router;

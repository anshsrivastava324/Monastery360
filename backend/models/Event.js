const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Event Basic Information
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventNameTranslations: {
        hindi: String,
        tibetan: String,
        nepali: String,
        dzongkha: String
    },
    
    // Event Details
    description: {
        type: String,
        required: true
    },
    descriptionTranslations: {
        hindi: String,
        tibetan: String,
        nepali: String,
        dzongkha: String
    },
    
    culturalSignificance: {
        type: String
    },
    
    // Event Classification
    eventType: {
        type: String,
        enum: ['Festival', 'Ritual', 'Ceremony', 'Prayer Session', 'Cultural Performance', 'Teaching', 'Celebration', 'Other'],
        required: true
    },
    
    eventCategory: {
        type: String,
        enum: ['Religious', 'Cultural', 'Traditional', 'Seasonal', 'Special Occasion']
    },
    
    // Monastery Association
    monasteryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monastery',
        required: true
    },
    monasteryName: {
        type: String,
        required: true
    },
    
    // Date and Time Information
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String // Format: "HH:MM"
    },
    endTime: {
        type: String
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Lunar Calendar', 'Custom']
    },
    
    // Location Details
    venueLocation: {
        type: String,
        required: true
    },
    venueDetails: {
        type: String
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    region: {
        type: String,
        enum: ['Sikkim', 'Arunachal Pradesh', 'Ladakh', 'Himachal Pradesh', 'Uttarakhand', 'West Bengal', 'Nepal', 'Bhutan', 'Tibet']
    },
    
    // Tourist Information
    touristAccess: {
        type: String,
        enum: ['Yes', 'No', 'Restricted'],
        default: 'Yes'
    },
    accessRestrictions: {
        type: String
    },
    bookingRequired: {
        type: String,
        enum: ['Yes', 'No', 'Recommended'],
        default: 'No'
    },
    bookingUrl: {
        type: String
    },
    contactEmail: {
        type: String
    },
    contactPhone: {
        type: String
    },
    
    // Additional Details
    dressCode: {
        type: String
    },
    guidelines: [String],
    
    maxAttendees: {
        type: Number
    },
    entryFee: {
        type: String,
        default: 'Free'
    },
    
    // Media
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    
    videoUrl: {
        type: String
    },
    
    // SEO and Search
    tags: [String],
    
    // Status
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better query performance
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ monasteryId: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ region: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ eventName: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);

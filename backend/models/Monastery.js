// models/Monastery.js
const mongoose = require('mongoose');

const monasterySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Number],  // [latitude, longitude]
        required: true,
        validate: {
            validator: function(v) {
                return v.length === 2;
            },
            message: 'Coordinates must be an array of [latitude, longitude]'
        }
    },
    district: {
        type: String,
        required: true,
        enum: ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim']
    },
    tradition: {
        type: String,
        required: true,
        enum: ['Karma Kagyu', 'Nyingmapa', 'Drukpa Kagyu', 'Gelugpa', 'Other']
    },
    established: {
        type: Number,
        required: true
    },
    altitude: {
        type: Number,
        required: true  // in meters
    },
    summary: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: ''
    },
    virtualTourUrl: {
        type: String,
        default: ''
    },
    images: [{
        type: String  // URLs of images
    }],
    festivals: [{
        name: String,
        date: String,
        description: String
    }],
    visitingHours: {
        type: String,
        default: '6:00 AM - 6:00 PM'
    },
    entryFee: {
        type: String,
        default: 'Free'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

// Index for geospatial queries
monasterySchema.index({ coordinates: '2dsphere' });

// Index for text search
monasterySchema.index({ name: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Monastery', monasterySchema);
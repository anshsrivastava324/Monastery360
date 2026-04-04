// models/Attraction.js
const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Viewpoint', 'Lake', 'Park', 'Market', 'Monument', 'Other'],
        default: 'Other'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

attractionSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Attraction', attractionSchema);
const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
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
    
    // Archive Content
    title: {
        type: String,
        required: true
    },
    
    content: {
        type: String,
        required: true // Main archive text content
    },
    
    // Multi-language Content
    contentTranslations: {
        hindi: String,
        tibetan: String,
        nepali: String,
        dzongkha: String
    },
    
    // Audio Guide
    audioGuide: {
        english: String, // URL or text for TTS
        hindi: String,
        tibetan: String,
        nepali: String,
        dzongkha: String
    },
    
    // Sections for detailed content
    sections: [{
        sectionTitle: String,
        sectionContent: String,
        order: Number
    }],
    
    // Historical Information
    foundedYear: String,
    founder: String,
    lineage: String,
    historicalSignificance: String,
    
    // Architecture & Art
    architecture: {
        style: String,
        description: String,
        notableFeatures: [String]
    },
    
    artworks: [{
        name: String,
        description: String,
        imageUrl: String
    }],
    
    // Cultural Information
    traditions: [String],
    festivals: [String],
    rituals: [String],
    
    // Images
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    
    coverImage: {
        type: String,
        required: true
    },
    
    // Location Details
    location: {
        address: String,
        region: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    
    // Metadata
    tags: [String],
    category: {
        type: String,
        enum: ['History', 'Architecture', 'Culture', 'Art', 'Spiritual', 'General']
    },
    
    // Statistics
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    
    // Publishing
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived'],
        default: 'Published'
    },
    
    publishedDate: {
        type: Date,
        default: Date.now
    },
    
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
archiveSchema.index({ monasteryName: 1 });
archiveSchema.index({ title: 'text', content: 'text' });
archiveSchema.index({ tags: 1 });

module.exports = mongoose.model('Archive', archiveSchema);
